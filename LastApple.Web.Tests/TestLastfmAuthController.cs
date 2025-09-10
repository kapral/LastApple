using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple.Web.Exceptions;
using LastApple.Web.Lastfm;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Time.Testing;

namespace LastApple.Web.Tests;

public class TestLastfmAuthController
{
    private ILastAuth mockAuthApi;
    private ISessionProvider mockSessionProvider;
    private ISessionRepository mockSessionRepository;
    private IUserApi mockUserApi;
    private IOptions<LastfmApiParams> mockApiParams;
    private LastfmAuthController controller;
    private FakeTimeProvider timeProvider;

    [SetUp]
    public void Setup()
    {
        mockAuthApi           = Substitute.For<ILastAuth>();
        mockSessionProvider   = Substitute.For<ISessionProvider>();
        mockSessionRepository = Substitute.For<ISessionRepository>();
        mockUserApi           = Substitute.For<IUserApi>();
        mockApiParams         = Substitute.For<IOptions<LastfmApiParams>>();
        mockApiParams.Value.Returns(new LastfmApiParams { ApiKey = "test-api-key" });
        timeProvider = new FakeTimeProvider(DateTimeOffset.Now);

        controller = new LastfmAuthController(mockAuthApi,
                                              mockSessionProvider,
                                              mockSessionRepository,
                                              mockUserApi,
                                              mockApiParams,
                                              timeProvider);
    }

    [Test]
    public void InitAuth_Throws_BadRequestException_For_Invalid_Url()
    {
        Assert.That(() => controller.InitAuth("invalid-url"), Throws.TypeOf<BadRequestException>());
    }

    [Test]
    public void InitAuth_Returns_Auth_Url_For_Valid_Redirect()
    {
        const string redirectUrl = "https://example.com/callback";
        const string expectedAuthUrl = "http://www.last.fm/api/auth?api_key=test-api-key&cb=https%3A%2F%2Fexample.com%2Fcallback";

        var result = controller.InitAuth(redirectUrl);

        Assert.That(result, Is.EqualTo(expectedAuthUrl));
    }

    [Test]
    public async Task CompleteAuth_Creates_New_Session_For_Empty_Session()
    {
        const string token = "auth-token";
        var emptySession = new Session(Guid.Empty, DateTimeOffset.MinValue, DateTimeOffset.MinValue, null, null, null, null);
        var userSession = Substitute.For<LastUserSession>();

        mockSessionProvider.GetSession().Returns(emptySession);
        mockAuthApi.UserSession.Returns(userSession);

        await controller.CompleteAuth(token);
        await mockSessionRepository.Received(1)
                                   .SaveSession(Arg.Is<Session>(s => s.Id != Guid.Empty
                                                                     && s.LastfmSessionKey == userSession.Token
                                                                     && s.LastfmUsername == userSession.Username
                                                                     && s.StartedAt == timeProvider.GetUtcNow()
                                                                     && s.LastActivityAt == timeProvider.GetUtcNow()));
        await mockAuthApi.Received(1).GetSessionTokenAsync(token);
    }

    [Test]
    public async Task CompleteAuth_Updates_Existing_Session()
    {
        const string token = "auth-token";
        var existingSession = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow.AddHours(-1),
            LastActivityAt: DateTimeOffset.UtcNow.AddMinutes(-30),
            LastfmSessionKey: null,
            LastfmUsername: null,
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );
        var userSession = new LastUserSession
        {
            Token    = "new-session-key",
            Username = "new-username"
        };

        mockSessionProvider.GetSession().Returns(existingSession);
        mockAuthApi.UserSession.Returns(userSession);

        await controller.CompleteAuth(token);

        await mockSessionRepository.Received(1)
                                   .SaveSession(existingSession with
                                   {
                                       LastActivityAt = timeProvider.GetUtcNow(),
                                       LastfmSessionKey = userSession.Token,
                                       LastfmUsername = userSession.Username
                                   });
        await mockAuthApi.Received(1).GetSessionTokenAsync(token);
    }

    [Test]
    public async Task Logout_Throws_BadRequestException_For_Empty_Session()
    {
        var emptySession = new Session(Guid.Empty, DateTimeOffset.MinValue, DateTimeOffset.MinValue, null, null, null, null);
        mockSessionProvider.GetSession().Returns(emptySession);

        Assert.That(async () => await controller.Logout(), Throws.TypeOf<BadRequestException>());
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

        await controller.Logout();
        await mockSessionRepository.Received(1)
                                   .SaveSession(existingSession with { LastfmSessionKey = null });
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

        Assert.That(result, Is.Null);
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
        var lastUser = new LastUser();

        mockSessionProvider.GetSession().Returns(session);
        mockUserApi.GetInfoAsync("testuser").Returns(new LastResponse<LastUser> { Content = lastUser });

        var user = await controller.GetAuthenticatedUser();

        Assert.That(user, Is.SameAs(lastUser));
    }
}