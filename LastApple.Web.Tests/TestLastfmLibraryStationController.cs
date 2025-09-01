using System.Linq;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple.Model;
using LastApple.PlaylistGeneration;

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
        mockStationRepository  = Substitute.For<IStationRepository>();
        mockStationGenerator   = Substitute.For<IStationGenerator<LastfmLibraryStationDefinition>>();
        mockProcessManager     = Substitute.For<IBackgroundProcessManager>();
        mockUserApi            = Substitute.For<IUserApi>();
        mockSessionProvider    = Substitute.For<ISessionProvider>();
        mockStorefrontProvider = Substitute.For<IStorefrontProvider>();

        controller = new LastfmLibraryStationController(mockStationRepository,
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
        var storefront = "us";

        mockSessionProvider.GetSession().Returns(session);
        mockStorefrontProvider.GetStorefront().Returns(storefront);
        mockUserApi.GetInfoAsync(session.LastfmUsername)
                   .Returns(new LastResponse<LastUser>() { Content = new LastUser() });

        var result = await controller.Create();
        var station = ((JsonResult)result).Value as Station<LastfmLibraryStationDefinition>;

        Assert.That(station, Is.Not.Null);
        Assert.That(station.Id, Is.Not.EqualTo(Guid.Empty));
        Assert.That(station.IsContinuous);

        mockProcessManager.Received().AddProcess(Arg.Any<Func<Task>>());

        var callback = mockProcessManager.ReceivedCalls()
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

        mockStationRepository.Get(stationId).Returns((StationBase)null);

        var result = await controller.TopUp(stationId, 10);

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task TopUp_Returns_NotFound_For_Wrong_Station_Type()
    {
        var stationId = Guid.NewGuid();
        var wrongTypeStation = Substitute.For<StationBase>();

        mockStationRepository.Get(stationId).Returns(wrongTypeStation);

        var result = await controller.TopUp(stationId, 10);

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task TopUp_Adds_TopUp_Process_For_Valid_Station()
    {
        var stationId = Guid.NewGuid();
        var definition = new LastfmLibraryStationDefinition("testuser");
        var station = new Station<LastfmLibraryStationDefinition>(definition) { Id = stationId };
        var storefront = "us";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.TopUp(stationId, 10);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());

        var callback = mockProcessManager.ReceivedCalls()
                                         .Single()
                                         .GetArguments()[0] as Func<Task>;

        Assert.That(callback, Is.Not.Null);
        await callback();

        await mockStationGenerator.Received().TopUp(station, storefront, 10);
    }
}