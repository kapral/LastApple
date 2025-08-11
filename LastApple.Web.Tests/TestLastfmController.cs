using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using IF.Lastfm.Core.Scrobblers;
using LastApple;
using LastApple.Model;
using LastApple.Web.Controllers;
using LastApple.Web.Models;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NUnit.Framework;

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
    public void Constructor_Throws_On_Null_SessionProvider()
    {
        Assert.That(() => new LastfmController(null, mockScrobbler, mockArtistApi, mockTrackApi, mockLastAuth),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("sessionProvider"));
    }

    [Test]
    public void Constructor_Throws_On_Null_Scrobbler()
    {
        Assert.That(() => new LastfmController(mockSessionProvider, null, mockArtistApi, mockTrackApi, mockLastAuth),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("scrobbler"));
    }

    [Test]
    public void Constructor_Throws_On_Null_ArtistApi()
    {
        Assert.That(() => new LastfmController(mockSessionProvider, mockScrobbler, null, mockTrackApi, mockLastAuth),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("artistApi"));
    }

    [Test]
    public void Constructor_Throws_On_Null_TrackApi()
    {
        Assert.That(() => new LastfmController(mockSessionProvider, mockScrobbler, mockArtistApi, null, mockLastAuth),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("trackApi"));
    }

    [Test]
    public void Constructor_Throws_On_Null_LastAuth()
    {
        Assert.That(() => new LastfmController(mockSessionProvider, mockScrobbler, mockArtistApi, mockTrackApi, null),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("lastAuth"));
    }

    [Test]
    public void Search_Throws_On_Empty_Term()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Search(""));
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Search("   "));
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Search(null));
    }

    [Test]
    public async Task Search_Returns_Artists_For_Valid_Term()
    {
        var searchTerm = "Beatles";

        Assert.DoesNotThrowAsync(async () => await controller.Search(searchTerm));
        await mockArtistApi.Received(1).SearchAsync(searchTerm);
    }

    [Test]
    public async Task Search_Returns_Empty_List_For_Null_Content()
    {
        var searchTerm = "NonExistentArtist";

        Assert.DoesNotThrowAsync(async () => await controller.Search(searchTerm));
        await mockArtistApi.Received(1).SearchAsync(searchTerm);
    }

    [Test]
    public async Task Scrobble_Returns_BadRequest_For_Empty_Artist()
    {
        var request = new ScrobbleRequest("", "Test Song", "Test Album", 180000);

        var result = await controller.Scrobble(request);

        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }

    [Test]
    public async Task Scrobble_Returns_BadRequest_For_Empty_Song()
    {
        var request = new ScrobbleRequest("Test Artist", "", "Test Album", 180000);

        var result = await controller.Scrobble(request);

        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }

    [Test]
    public async Task Scrobble_Returns_Unauthorized_For_No_Session_Key()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album", 180000);
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, null, "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        var result = await controller.Scrobble(request);

        Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
    }

    [Test]
    public async Task Scrobble_Calls_ScrobbleAsync_For_Valid_Request()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album", 180000);
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, "session-key", "testuser", "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        var result = await controller.Scrobble(request);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockLastAuth.Received(1).LoadSession(Arg.Any<LastUserSession>());
        await mockScrobbler.Received(1).ScrobbleAsync(Arg.Any<Scrobble>());
    }

    [Test]
    public async Task NowPlaying_Returns_BadRequest_For_Empty_Artist()
    {
        var request = new ScrobbleRequest("", "Test Song", "Test Album", 180000);

        var result = await controller.NowPlaying(request);

        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }

    [Test]
    public async Task NowPlaying_Returns_BadRequest_For_Empty_Song()
    {
        var request = new ScrobbleRequest("Test Artist", "", "Test Album", 180000);

        var result = await controller.NowPlaying(request);

        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }

    [Test]
    public async Task NowPlaying_Returns_Unauthorized_For_No_Session_Key()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album", 180000);
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, null, "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        var result = await controller.NowPlaying(request);

        Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
    }

    [Test]
    public async Task NowPlaying_Calls_UpdateNowPlayingAsync_For_Valid_Request()
    {
        var request = new ScrobbleRequest("Test Artist", "Test Song", "Test Album", 180000);
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, "session-key", "testuser", "music-token", "us");

        mockSessionProvider.GetSession().Returns(session);

        var result = await controller.NowPlaying(request);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockLastAuth.Received(1).LoadSession(Arg.Any<LastUserSession>());
        await mockTrackApi.Received(1).UpdateNowPlayingAsync(Arg.Any<Scrobble>());
    }
}