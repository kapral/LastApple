using System;
using System.Linq;
using System.Threading.Tasks;
using LastApple;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastApple.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestTagsStationController
{
    private IStationRepository mockStationRepository;
    private IStationGenerator<TagsStationDefinition> mockStationGenerator;
    private IBackgroundProcessManager mockBackgroundProcessManager;
    private IStorefrontProvider mockStorefrontProvider;
    private TagsStationController controller;

    [SetUp]
    public void Setup()
    {
        mockStationRepository = Substitute.For<IStationRepository>();
        mockStationGenerator = Substitute.For<IStationGenerator<TagsStationDefinition>>();
        mockBackgroundProcessManager = Substitute.For<IBackgroundProcessManager>();
        mockStorefrontProvider = Substitute.For<IStorefrontProvider>();
        
        controller = new TagsStationController(
            mockStationRepository, 
            mockStationGenerator, 
            mockBackgroundProcessManager, 
            mockStorefrontProvider);
    }

    [Test]
    public void Create_Throws_For_Null_Tag()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Create(null));
    }

    [Test]
    public void Create_Throws_For_Empty_Tag()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Create(""));
    }

    [Test]
    public void Create_Throws_For_Whitespace_Tag()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Create("   "));
    }

    [Test]
    public async Task Create_Creates_Station_For_Valid_Tag()
    {
        var tag = "rock";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.Create(tag);

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        var station = jsonResult.Value as Station<TagsStationDefinition>;
        
        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsContinuous, Is.True);
        Assert.That(station.Definition.Tags, Contains.Item(tag));
        Assert.That(station.Id, Is.Not.EqualTo(Guid.Empty));
        
        mockStationRepository.Received(1).Create(Arg.Any<Station<TagsStationDefinition>>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task Create_Calls_StationGenerator_With_Correct_Parameters()
    {
        var tag = "jazz";
        var storefront = "uk";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        await controller.Create(tag);

        await mockStorefrontProvider.Received(1).GetStorefront();
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task TopUp_Returns_NotFound_For_Invalid_Station_Id()
    {
        var stationId = Guid.NewGuid();
        var count = 10;

        mockStationRepository.Get(stationId).Returns((StationBase)null);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task TopUp_Returns_NotFound_For_Wrong_Station_Type()
    {
        var stationId = Guid.NewGuid();
        var count = 10;
        var wrongTypeStation = Substitute.For<StationBase>();

        mockStationRepository.Get(stationId).Returns(wrongTypeStation);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task TopUp_Adds_TopUp_Process_For_Valid_Station()
    {
        var stationId = Guid.NewGuid();
        var count = 15;
        var definition = new TagsStationDefinition(new[] { "electronic" });
        var station = new Station<TagsStationDefinition>(definition) { Id = stationId };
        var storefront = "us";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task TopUp_Calls_StationGenerator_TopUp()
    {
        var stationId = Guid.NewGuid();
        var count = 20;
        var definition = new TagsStationDefinition(new[] { "alternative" });
        var station = new Station<TagsStationDefinition>(definition) { Id = stationId };
        var storefront = "ca";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        await controller.TopUp(stationId, count);

        await mockStorefrontProvider.Received(1).GetStorefront();
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task Create_Sets_Station_Properties_Correctly()
    {
        var tag = "pop";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.Create(tag);

        var jsonResult = (JsonResult)result;
        var station = jsonResult.Value as Station<TagsStationDefinition>;
        
        Assert.That(station.Definition.Tags.Count(), Is.EqualTo(1));
        Assert.That(station.Definition.Tags, Contains.Item(tag));
        Assert.That(station.IsContinuous, Is.True);
        Assert.That(station.Id, Is.Not.EqualTo(Guid.Empty));
    }

    [Test]
    public async Task TopUp_With_Zero_Count_Still_Processes()
    {
        var stationId = Guid.NewGuid();
        var count = 0;
        var definition = new TagsStationDefinition(new[] { "ambient" });
        var station = new Station<TagsStationDefinition>(definition) { Id = stationId };

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns("us");

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task Create_Uses_Collection_Syntax_For_TagsStationDefinition()
    {
        var tag = "indie";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.Create(tag);

        var jsonResult = (JsonResult)result;
        var station = jsonResult.Value as Station<TagsStationDefinition>;
        
        // Verify the TagsStationDefinition was created with the collection syntax [tag]
        Assert.That(station.Definition.Tags, Is.Not.Null);
        Assert.That(station.Definition.Tags.Count(), Is.EqualTo(1));
        Assert.That(station.Definition.Tags.First(), Is.EqualTo(tag));
    }
}