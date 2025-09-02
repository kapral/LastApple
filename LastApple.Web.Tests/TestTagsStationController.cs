using System.Linq;
using LastApple.Model;
using LastApple.PlaylistGeneration;

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
        mockStationRepository        = Substitute.For<IStationRepository>();
        mockStationGenerator         = Substitute.For<IStationGenerator<TagsStationDefinition>>();
        mockBackgroundProcessManager = Substitute.For<IBackgroundProcessManager>();
        mockStorefrontProvider       = Substitute.For<IStorefrontProvider>();

        controller = new TagsStationController(mockStationRepository,
                                               mockStationGenerator,
                                               mockBackgroundProcessManager,
                                               mockStorefrontProvider);
    }

    [Test]
    public void Create_Throws_For_Null_Or_Whitespace_Tag()
    {
        Assert.That(() => controller.Create(null!), Throws.ArgumentNullException);
        Assert.That(() => controller.Create(string.Empty), Throws.ArgumentException);
        Assert.That(() => controller.Create("   "), Throws.ArgumentException);
    }

    [Test]
    public async Task Create_Creates_Station_For_Valid_Tag()
    {
        var tag = "rock";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var station = await controller.Create(tag);

        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsContinuous, Is.True);
        Assert.That(station.Definition.Tags, Contains.Item(tag));
        Assert.That(station.Id, Is.Not.EqualTo(Guid.Empty));

        mockStationRepository.Received(1).Create(Arg.Any<Station<TagsStationDefinition>>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());

        var callback = mockBackgroundProcessManager.ReceivedCalls()
                                                   .Single()
                                                   .GetArguments()[0] as Func<Task>;

        Assert.That(callback, Is.Not.Null);
        await callback();

        await mockStationGenerator.Received().Generate(station, storefront);
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
        var stationId  = Guid.NewGuid();
        var count      = 15;
        var definition = new TagsStationDefinition(["electronic"]);
        var station    = new Station<TagsStationDefinition>(definition) { Id = stationId };
        var storefront = "us";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());

        var callback = mockBackgroundProcessManager.ReceivedCalls()
                                                   .Single()
                                                   .GetArguments()[0] as Func<Task>;

        Assert.That(callback, Is.Not.Null);
        await callback();

        await mockStationGenerator.Received().TopUp(station, storefront, count);
    }


}