using System;
using System.Threading.Tasks;
using LastApple;
using LastApple.Web.Controllers;
using LastApple.Web.Models;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestAppleAuthController
{
    private IDeveloperTokenProvider mockTokenProvider;
    private ISessionProvider mockSessionProvider;
    private ISessionRepository mockSessionRepository;
    private AppleAuthController controller;

    [SetUp]
    public void Setup()
    {
        mockTokenProvider = Substitute.For<IDeveloperTokenProvider>();
        mockSessionProvider = Substitute.For<ISessionProvider>();
        mockSessionRepository = Substitute.For<ISessionRepository>();
        controller = new AppleAuthController(mockTokenProvider, mockSessionProvider, mockSessionRepository);
    }

    [Test]
    public void Constructor_Throws_On_Null_TokenProvider()
    {
        Assert.That(() => new AppleAuthController(null, mockSessionProvider, mockSessionRepository),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("tokenProvider"));
    }

    [Test]
    public void Constructor_Throws_On_Null_SessionProvider()
    {
        Assert.That(() => new AppleAuthController(mockTokenProvider, null, mockSessionRepository),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("sessionProvider"));
    }

    [Test]
    public void Constructor_Throws_On_Null_SessionRepository()
    {
        Assert.That(() => new AppleAuthController(mockTokenProvider, mockSessionProvider, null),
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("sessionRepository"));
    }

    [Test]
    public void GetDeveloperToken_Returns_Token_From_Provider()
    {
        var expectedToken = "test-developer-token";
        mockTokenProvider.GetToken().Returns(expectedToken);

        var result = controller.GetDeveloperToken();

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        Assert.That(jsonResult.Value, Is.EqualTo(expectedToken));
    }

    [Test]
    public async Task GetSessionData_Returns_Session_From_Provider()
    {
        var expectedSession = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow,
            LastActivityAt: DateTimeOffset.UtcNow,
            LastfmSessionKey: "lastfm-key",
            LastfmUsername: "testuser",
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );
        mockSessionProvider.GetSession().Returns(expectedSession);

        var result = await controller.GetSessionData();

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        Assert.That(jsonResult.Value, Is.EqualTo(expectedSession));
    }

    [Test]
    public async Task PostSessionData_Creates_New_Session_For_Empty_Session()
    {
        var emptySession = new Session(Guid.Empty, DateTimeOffset.MinValue, DateTimeOffset.MinValue, null, null, null, null);
        mockSessionProvider.GetSession().Returns(emptySession);

        var sessionData = new AppleMusicSessionData("new-token", "us");

        var result = await controller.PostSessionData(sessionData);

        Assert.That(result, Is.InstanceOf<JsonResult>());
        await mockSessionRepository.Received(1).SaveSession(Arg.Any<Session>());
    }

    [Test]
    public async Task PostSessionData_Updates_Existing_Session()
    {
        var existingSession = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow.AddHours(-1),
            LastActivityAt: DateTimeOffset.UtcNow.AddMinutes(-30),
            LastfmSessionKey: "lastfm-key",
            LastfmUsername: "testuser",
            MusicUserToken: "old-token",
            MusicStorefrontId: "uk"
        );
        mockSessionProvider.GetSession().Returns(existingSession);

        var sessionData = new AppleMusicSessionData("new-token", "us");

        var result = await controller.PostSessionData(sessionData);

        Assert.That(result, Is.InstanceOf<JsonResult>());
        await mockSessionRepository.Received(1).SaveSession(Arg.Any<Session>());
    }

    [Test]
    public async Task DeleteSessionData_Returns_BadRequest_For_Empty_Session()
    {
        var emptySession = new Session(Guid.Empty, DateTimeOffset.MinValue, DateTimeOffset.MinValue, null, null, null, null);
        mockSessionProvider.GetSession().Returns(emptySession);

        var result = await controller.DeleteSessionData();

        Assert.That(result, Is.InstanceOf<BadRequestResult>());
    }

    [Test]
    public async Task DeleteSessionData_Clears_Music_Data_For_Valid_Session()
    {
        var existingSession = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow.AddHours(-1),
            LastActivityAt: DateTimeOffset.UtcNow.AddMinutes(-30),
            LastfmSessionKey: "lastfm-key",
            LastfmUsername: "testuser",
            MusicUserToken: "token",
            MusicStorefrontId: "us"
        );
        mockSessionProvider.GetSession().Returns(existingSession);

        var result = await controller.DeleteSessionData();

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        await mockSessionRepository.Received(1).SaveSession(Arg.Any<Session>());
    }
}