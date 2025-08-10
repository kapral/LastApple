using System;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastApple.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestLastfmLibraryStationController
{
    private IStationRepository mockStationRepository;
    private IStationGenerator<LastfmLibraryStationDefinition> mockStationGenerator;
    private IBackgroundProcessManager mockProcessManager;
    private IUserApi mockUserApi;
    private ISessionProvider mockSessionProvider;
    private IStorefrontProvider mockStorefrontProvider;
    private LastfmLibraryStationController controller;

    [SetUp]
    public void Setup()
    {
        mockStationRepository = Substitute.For<IStationRepository>();
        mockStationGenerator = Substitute.For<IStationGenerator<LastfmLibraryStationDefinition>>();
        mockProcessManager = Substitute.For<IBackgroundProcessManager>();
        mockUserApi = Substitute.For<IUserApi>();
        mockSessionProvider = Substitute.For<ISessionProvider>();
        mockStorefrontProvider = Substitute.For<IStorefrontProvider>();
        
        controller = new LastfmLibraryStationController(
            mockStationRepository, 
            mockStationGenerator, 
            mockProcessManager, 
            mockUserApi, 
            mockSessionProvider, 
            mockStorefrontProvider);
    }

    [Test]
    public async Task Create_Returns_Unauthorized_For_Empty_Session()
    {
        var emptySession = new Session(Guid.Empty, DateTimeOffset.MinValue, DateTimeOffset.MinValue, null, null, null, null);
        mockSessionProvider.GetSession().Returns(emptySession);

        var result = await controller.Create();

        Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
    }

    [Test]
    public async Task Create_Creates_Station_For_Valid_Session()
    {
        var session = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow,
            LastActivityAt: DateTimeOffset.UtcNow,
            LastfmSessionKey: "session-key",
            LastfmUsername: "testuser",
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );
        var user = Substitute.For<LastUser>();
        user.Name.Returns("Test User");
        var userResponse = Substitute.For<LastResponse<LastUser>>();
        userResponse.Content.Returns(user);
        var storefront = "us";

        mockSessionProvider.GetSession().Returns(session);
        mockUserApi.GetInfoAsync("testuser").Returns(userResponse);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.Create();

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        var station = jsonResult.Value as Station<LastfmLibraryStationDefinition>;
        
        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsContinuous, Is.True);
        Assert.That(station.Definition.User, Is.EqualTo("Test User"));
        Assert.That(station.Id, Is.Not.EqualTo(Guid.Empty));
        
        mockStationRepository.Received(1).Create(Arg.Any<Station<LastfmLibraryStationDefinition>>());
        mockProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
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
        var count = 10;
        var definition = new LastfmLibraryStationDefinition("testuser");
        var station = new Station<LastfmLibraryStationDefinition>(definition) { Id = stationId };
        var storefront = "us";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task Create_Calls_UserApi_With_Session_Username()
    {
        var session = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow,
            LastActivityAt: DateTimeOffset.UtcNow,
            LastfmSessionKey: "session-key",
            LastfmUsername: "specific-username",
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );
        var user = Substitute.For<LastUser>();
        user.Name.Returns("Test User");
        var userResponse = Substitute.For<LastResponse<LastUser>>();
        userResponse.Content.Returns(user);

        mockSessionProvider.GetSession().Returns(session);
        mockUserApi.GetInfoAsync("specific-username").Returns(userResponse);
        mockStorefrontProvider.GetStorefront().Returns("us");

        await controller.Create();

        await mockUserApi.Received(1).GetInfoAsync("specific-username");
    }

    [Test]
    public async Task TopUp_Calls_StationGenerator_With_Correct_Parameters()
    {
        var stationId = Guid.NewGuid();
        var count = 25;
        var definition = new LastfmLibraryStationDefinition("testuser");
        var station = new Station<LastfmLibraryStationDefinition>(definition) { Id = stationId };
        var storefront = "uk";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        await controller.TopUp(stationId, count);

        await mockStorefrontProvider.Received(1).GetStorefront();
        mockProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }
}