using System;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple;
using LastApple.Web.Controllers;
using LastApple.Web.Lastfm;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestLastfmAuthController
{
    private ILastAuth mockAuthApi;
    private ISessionProvider mockSessionProvider;
    private ISessionRepository mockSessionRepository;
    private IUserApi mockUserApi;
    private IOptions<LastfmApiParams> mockApiParams;
    private LastfmAuthController controller;

    [SetUp]
    public void Setup()
    {
        mockAuthApi = Substitute.For<ILastAuth>();
        mockSessionProvider = Substitute.For<ISessionProvider>();
        mockSessionRepository = Substitute.For<ISessionRepository>();
        mockUserApi = Substitute.For<IUserApi>();
        mockApiParams = Substitute.For<IOptions<LastfmApiParams>>();
        mockApiParams.Value.Returns(new LastfmApiParams { ApiKey = "test-api-key" });
        
        controller = new LastfmAuthController(mockAuthApi, mockSessionProvider, mockSessionRepository, mockUserApi, mockApiParams);
    }

    [Test]
    public void Constructor_Throws_On_Null_AuthApi()
    {
        Assert.That(() => new LastfmAuthController(null, mockSessionProvider, mockSessionRepository, mockUserApi, mockApiParams),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("authApi"));
    }

    [Test]
    public void Constructor_Throws_On_Null_SessionProvider()
    {
        Assert.That(() => new LastfmAuthController(mockAuthApi, null, mockSessionRepository, mockUserApi, mockApiParams),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("sessionProvider"));
    }

    [Test]
    public void Constructor_Throws_On_Null_SessionRepository()
    {
        Assert.That(() => new LastfmAuthController(mockAuthApi, mockSessionProvider, null, mockUserApi, mockApiParams),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("sessionRepository"));
    }

    [Test]
    public void Constructor_Throws_On_Null_UserApi()
    {
        Assert.That(() => new LastfmAuthController(mockAuthApi, mockSessionProvider, mockSessionRepository, null, mockApiParams),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("userApi"));
    }

    [Test]
    public void Constructor_Throws_On_Null_ApiParams()
    {
        Assert.That(() => new LastfmAuthController(mockAuthApi, mockSessionProvider, mockSessionRepository, mockUserApi, null),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("apiParams"));
    }

    [Test]
    public void InitAuth_Returns_BadRequest_For_Invalid_Url()
    {
        var result = controller.InitAuth("invalid-url");

        Assert.That(result, Is.InstanceOf<BadRequestResult>());
    }

    [Test]
    public void InitAuth_Returns_Auth_Url_For_Valid_Redirect()
    {
        var redirectUrl = "https://example.com/callback";

        var result = controller.InitAuth(redirectUrl);

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        var authUrl = jsonResult.Value.ToString();
        Assert.That(authUrl, Contains.Substring("www.last.fm/api/auth"));
        Assert.That(authUrl, Contains.Substring("test-api-key"));
        Assert.That(authUrl, Contains.Substring(Uri.EscapeDataString(redirectUrl)));
    }

    [Test]
    public async Task CompleteAuth_Creates_New_Session_For_Empty_Session()
    {
        var token = "auth-token";
        var emptySession = new Session(Guid.Empty, DateTimeOffset.MinValue, DateTimeOffset.MinValue, null, null, null, null);
        var userSession = Substitute.For<LastUserSession>();

        mockSessionProvider.GetSession().Returns(emptySession);
        mockAuthApi.UserSession.Returns(userSession);

        Assert.DoesNotThrowAsync(async () => await controller.CompleteAuth(token));
        await mockAuthApi.Received(1).GetSessionTokenAsync(token);
    }

    [Test]
    public async Task CompleteAuth_Updates_Existing_Session()
    {
        var token = "auth-token";
        var existingSession = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow.AddHours(-1),
            LastActivityAt: DateTimeOffset.UtcNow.AddMinutes(-30),
            LastfmSessionKey: null,
            LastfmUsername: null,
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );
        var userSession = Substitute.For<LastUserSession>();

        mockSessionProvider.GetSession().Returns(existingSession);
        mockAuthApi.UserSession.Returns(userSession);

        Assert.DoesNotThrowAsync(async () => await controller.CompleteAuth(token));
        await mockAuthApi.Received(1).GetSessionTokenAsync(token);
    }

    [Test]
    public async Task Logout_Returns_BadRequest_For_Empty_Session()
    {
        var emptySession = new Session(Guid.Empty, DateTimeOffset.MinValue, DateTimeOffset.MinValue, null, null, null, null);
        mockSessionProvider.GetSession().Returns(emptySession);

        var result = await controller.Logout();

        Assert.That(result, Is.InstanceOf<BadRequestResult>());
    }

    [Test]
    public async Task Logout_Clears_LastFM_Session_For_Valid_Session()
    {
        var existingSession = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow.AddHours(-1),
            LastActivityAt: DateTimeOffset.UtcNow.AddMinutes(-30),
            LastfmSessionKey: "session-key",
            LastfmUsername: "testuser",
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );
        mockSessionProvider.GetSession().Returns(existingSession);

        var result = await controller.Logout();

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        await mockSessionRepository.Received(1).SaveSession(Arg.Any<Session>());
    }

    [Test]
    public async Task GetAuthenticatedUser_Returns_Null_For_No_Session_Key()
    {
        var session = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow,
            LastActivityAt: DateTimeOffset.UtcNow,
            LastfmSessionKey: null,
            LastfmUsername: null,
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );
        mockSessionProvider.GetSession().Returns(session);

        var result = await controller.GetAuthenticatedUser();

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        Assert.That(jsonResult.Value, Is.Null);
    }

    [Test]
    public async Task GetAuthenticatedUser_Returns_User_Info_For_Valid_Session()
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

        mockSessionProvider.GetSession().Returns(session);

        Assert.ThrowsAsync<NullReferenceException>(async () => await controller.GetAuthenticatedUser());
        await mockUserApi.Received(1).GetInfoAsync("testuser");
    }
}