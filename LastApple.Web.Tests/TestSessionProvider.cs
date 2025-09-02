using Microsoft.AspNetCore.Http;

namespace LastApple.Web.Tests;

public class TestSessionProvider
{
    private ISessionRepository mockSessionRepository;
    private IHttpContextAccessor mockHttpContextAccessor;
    private HttpContext mockHttpContext;
    private SessionProvider sessionProvider;

    [SetUp]
    public void Setup()
    {
        mockSessionRepository   = Substitute.For<ISessionRepository>();
        mockHttpContextAccessor = Substitute.For<IHttpContextAccessor>();
        mockHttpContext         = Substitute.For<HttpContext>();

        mockHttpContextAccessor.HttpContext.Returns(mockHttpContext);
        sessionProvider = new SessionProvider(mockSessionRepository, mockHttpContextAccessor);
    }

    [Test]
    public async Task GetSession_Returns_Default_When_Invalid_SessionId()
    {
        var headers = new HeaderDictionary { ["X-SessionId"] = "invalid-guid" };
        var request = Substitute.For<HttpRequest>();
        request.Headers.Returns(headers);
        mockHttpContext.Request.Returns(request);

        var result = await sessionProvider.GetSession();

        Assert.That(result, Is.EqualTo(default(Session)));
        await mockSessionRepository.DidNotReceive().GetSession(Arg.Any<Guid>());
    }

    [Test]
    public async Task GetSession_Returns_Default_When_No_SessionId_Header()
    {
        var headers = new HeaderDictionary();
        var request = Substitute.For<HttpRequest>();
        request.Headers.Returns(headers);
        mockHttpContext.Request.Returns(request);

        var result = await sessionProvider.GetSession();

        Assert.That(result, Is.EqualTo(default(Session)));
    }

    [Test]
    public async Task GetSession_Returns_Session_When_Valid_SessionId()
    {
        var sessionId = Guid.NewGuid();
        var session = new Session(sessionId, DateTimeOffset.UtcNow.AddHours(-1),
            DateTimeOffset.UtcNow.AddMinutes(-10), "lastfm-key", "user", "music-token", "us");

        var headers = new HeaderDictionary { ["X-SessionId"] = sessionId.ToString() };
        var request = Substitute.For<HttpRequest>();
        request.Headers.Returns(headers);
        mockHttpContext.Request.Returns(request);

        mockSessionRepository.GetSession(sessionId).Returns(session);

        var result = await sessionProvider.GetSession();

        Assert.That(result, Is.EqualTo(session));
        await mockSessionRepository.Received(1).GetSession(sessionId);
    }

    [Test]
    public async Task GetSession_Updates_LastActivityAt_When_Activity_Threshold_Exceeded()
    {
        var sessionId = Guid.NewGuid();
        var oldActivityTime = DateTimeOffset.UtcNow.AddMinutes(-35); // More than 30 minutes ago
        var session = new Session(sessionId, DateTimeOffset.UtcNow.AddHours(-2),
            oldActivityTime, "lastfm-key", "user", "music-token", "us");

        var headers = new HeaderDictionary { ["X-SessionId"] = sessionId.ToString() };
        var request = Substitute.For<HttpRequest>();
        request.Headers.Returns(headers);
        mockHttpContext.Request.Returns(request);

        mockSessionRepository.GetSession(sessionId).Returns(session);

        var result = await sessionProvider.GetSession();

        Assert.That(result.LastActivityAt, Is.GreaterThan(oldActivityTime));
        await mockSessionRepository.Received(1).SaveSession(Arg.Is<Session>(s =>
            s.Id == sessionId && s.LastActivityAt > oldActivityTime));
    }

    [Test]
    public async Task GetSession_Does_Not_Update_Activity_When_Within_Threshold()
    {
        var sessionId = Guid.NewGuid();
        var recentActivityTime = DateTimeOffset.UtcNow.AddMinutes(-10); // Within 30 minute threshold
        var session = new Session(sessionId, DateTimeOffset.UtcNow.AddHours(-1),
            recentActivityTime, "lastfm-key", "user", "music-token", "us");

        var headers = new HeaderDictionary { ["X-SessionId"] = sessionId.ToString() };
        var request = Substitute.For<HttpRequest>();
        request.Headers.Returns(headers);
        mockHttpContext.Request.Returns(request);

        mockSessionRepository.GetSession(sessionId).Returns(session);

        var result = await sessionProvider.GetSession();

        Assert.That(result.LastActivityAt, Is.EqualTo(recentActivityTime));
        await mockSessionRepository.DidNotReceive().SaveSession(Arg.Any<Session>());
    }

    [Test]
    public void GetSession_Throws_When_HttpContext_Not_Available()
    {
        mockHttpContextAccessor.HttpContext.Returns((HttpContext)null);

        Assert.That(() => sessionProvider.GetSession(),
            Throws.InvalidOperationException.With.Message.EqualTo("HttpContext is not available"));
    }
}