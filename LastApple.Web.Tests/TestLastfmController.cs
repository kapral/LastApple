using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using IF.Lastfm.Core.Scrobblers;
using LastApple.Web.Exceptions;

namespace LastApple.Web.Tests;

public class TestLastfmController
{
    private ISessionProvider mockSessionProvider;
    private IScrobbler mockScrobbler;
    private IArtistApi mockArtistApi;
    private ITrackApi mockTrackApi;
    private ILastAuth mockLastAuth;
    private LastfmController controller;

    [SetUp]
    public void Setup()
    {
        mockSessionProvider = Substitute.For<ISessionProvider>();
        mockScrobbler = Substitute.For<IScrobbler>();
        mockArtistApi = Substitute.For<IArtistApi>();
        mockTrackApi = Substitute.For<ITrackApi>();
        mockLastAuth = Substitute.For<ILastAuth>();

        controller = new LastfmController(mockSessionProvider, mockScrobbler, mockArtistApi, mockTrackApi, mockLastAuth);
    }

    [Test]
    public void Search_Throws_On_Empty_Term()
    {
        Assert.That(() => controller.Search(""), Throws.ArgumentException);
        Assert.That(() => controller.Search("   "), Throws.ArgumentException);
        Assert.That(() => controller.Search(null!), Throws.ArgumentNullException);
    }

    [Test]
    public async Task Search_Returns_Artists_For_Valid_Term()
    {
        const string searchTerm = "Beatles";

        var artists = new[] { new LastArtist() };
        mockArtistApi.SearchAsync(searchTerm).Returns(new PageResponse<LastArtist>(artists));

        var result = await controller.Search(searchTerm);

        Assert.That(result, Is.EqualTo(artists));
    }

    [Test]
    public void Scrobble_Throws_BadRequestException_For_Empty_Artist()
    {
        var request = new ScrobbleRequest("", "Test Song", "Test Album");

        Assert.That(() => controller.Scrobble(request), Throws.TypeOf<BadRequestException>());
    }

    [Test]
    public void Scrobble_Throws_BadRequestException_For_Empty_Song()
    {
        var request = new ScrobbleRequest("Test Artist", "", "Test Album");

        Assert.That(() => controller.Scrobble(request), Throws.TypeOf<BadRequestException>());
    }

    [Test]
    public void Scrobble_Throws_UnauthorizedException_For_No_Session_Key()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album");
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, null, "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        Assert.That(() => controller.Scrobble(request), Throws.TypeOf<UnauthorizedException>());
    }

    [Test]
    public async Task Scrobble_Calls_ScrobbleAsync_For_Valid_Request()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album", 300000);
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, "session-key", "testuser", "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        await controller.Scrobble(request);
        mockLastAuth.Received(1).LoadSession(Arg.Is<LastUserSession>(s => s.Token == "session-key"));
        await mockScrobbler.Received(1).ScrobbleAsync(Arg.Is<Scrobble>(s => s.Artist == "Test Artist" && s.Track == "Test Song" && s.Album == "Test Album" && s.Duration == TimeSpan.FromMinutes(5)));
    }

    [Test]
    public void NowPlaying_Throws_BadRequestException_For_Empty_Artist()
    {
        var request = new ScrobbleRequest("", "Test Song", "Test Album");

        Assert.That(() => controller.NowPlaying(request), Throws.TypeOf<BadRequestException>());
    }

    [Test]
    public void NowPlaying_Throws_BadRequestException_For_Empty_Song()
    {
        var request = new ScrobbleRequest("Test Artist", "", "Test Album");

        Assert.That(() => controller.NowPlaying(request), Throws.TypeOf<BadRequestException>());
    }

    [Test]
    public void NowPlaying_Throws_UnauthorizedException_For_No_Session_Key()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album");
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, null, "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        Assert.That(() => controller.NowPlaying(request), Throws.TypeOf<UnauthorizedException>());
    }

    [Test]
    public async Task NowPlaying_Calls_UpdateNowPlayingAsync_For_Valid_Request()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album", 300000);
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, "session-key", "testuser", "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        await controller.NowPlaying(request);
        mockLastAuth.Received(1).LoadSession(Arg.Is<LastUserSession>(s => s.Token == "session-key"));
        await mockTrackApi.Received(1).UpdateNowPlayingAsync(Arg.Is<Scrobble>(s => s.Artist == "Test Artist"
                                                                                   && s.Track == "Test Song"
                                                                                   && s.Album == "Test Album"
                                                                                   && s.Duration == TimeSpan.FromMinutes(5)));
    }
}