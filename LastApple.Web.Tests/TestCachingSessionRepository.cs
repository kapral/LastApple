using Microsoft.Extensions.Caching.Memory;

namespace LastApple.Web.Tests;

public class TestCachingSessionRepository
{
    private ISessionRepository mockConcreteRepository;
    private IMemoryCache memoryCache;
    private CachingSessionRepository cachingRepository;

    [SetUp]
    public void Setup()
    {
        mockConcreteRepository = Substitute.For<ISessionRepository>();
        memoryCache            = new MemoryCache(new MemoryCacheOptions());
        cachingRepository      = new CachingSessionRepository(mockConcreteRepository, memoryCache);
    }

    [Test]
    public async Task GetSession_Calls_Concrete_Repository_When_Cache_Miss()
    {
        var sessionId = Guid.NewGuid();
        var expectedSession = new Session(sessionId,
                                          DateTimeOffset.UtcNow,
                                          DateTimeOffset.UtcNow,
                                          "lastfm-key",
                                          "user",
                                          "music-token",
                                          "us");

        mockConcreteRepository.GetSession(sessionId).Returns(expectedSession);

        var result = await cachingRepository.GetSession(sessionId);

        Assert.That(result, Is.EqualTo(expectedSession));
    }

    [Test]
    public async Task SaveSession_Caches_Session()
    {
        var session1 = new Session(Guid.NewGuid(),
                                  DateTimeOffset.UtcNow,
                                  DateTimeOffset.UtcNow,
                                  "lastfm-key",
                                  "user",
                                  "music-token",
                                  "us");

        mockConcreteRepository.When(x => x.SaveSession(session1)).Do(_ =>
        {
            mockConcreteRepository.GetSession(session1.Id).Returns(session1);
        });

        await cachingRepository.SaveSession(session1);

        var cachedSession1 = await cachingRepository.GetSession(session1.Id);
        var cachedSession2 = await cachingRepository.GetSession(session1.Id);

        Assert.That(cachedSession1, Is.EqualTo(session1));
        Assert.That(cachedSession2, Is.EqualTo(session1));
        await mockConcreteRepository.Received().SaveSession(session1);
        await mockConcreteRepository.Received(1).GetSession(session1.Id);

        var session2 = new Session(Guid.NewGuid(),
                                   DateTimeOffset.UtcNow,
                                   DateTimeOffset.UtcNow,
                                   "lastfm-key-2",
                                   "user-2",
                                   "music-token-2",
                                   "uk");

        mockConcreteRepository.When(x => x.SaveSession(session2)).Do(_ =>
        {
            mockConcreteRepository.GetSession(session2.Id).Returns(session2);
        });

        await cachingRepository.SaveSession(session2);

        var cachedSession3 = await cachingRepository.GetSession(session2.Id);

        Assert.That(cachedSession3, Is.EqualTo(session2));
        await mockConcreteRepository.Received().SaveSession(session2);
    }
}