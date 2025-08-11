using System;
using System.Threading.Tasks;
using LastApple;
using LastApple.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestCachingSessionRepository
{
    private ISessionRepository mockConcreteRepository;
    private IMemoryCache mockMemoryCache;
    private CachingSessionRepository cachingRepository;

    [SetUp]
    public void Setup()
    {
        mockConcreteRepository = Substitute.For<ISessionRepository>();
        mockMemoryCache = Substitute.For<IMemoryCache>();
        cachingRepository = new CachingSessionRepository(mockConcreteRepository, mockMemoryCache);
    }

    [Test]
    public async Task GetSession_Calls_Concrete_Repository_When_Cache_Miss()
    {
        var sessionId = Guid.NewGuid();
        var expectedSession = new Session(sessionId, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, 
            "lastfm-key", "user", "music-token", "us");

        // Mock cache miss - MemoryCache.GetOrCreateAsync will call the factory
        mockConcreteRepository.GetSession(sessionId).Returns(expectedSession);

        var result = await cachingRepository.GetSession(sessionId);

        Assert.That(result, Is.EqualTo(expectedSession));
        await mockConcreteRepository.Received().GetSession(sessionId);
    }

    [Test]
    public void SaveSession_Works_With_Valid_Session()
    {
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, 
            "lastfm-key", "user", "music-token", "us");

        Assert.DoesNotThrowAsync(async () => await cachingRepository.SaveSession(session));
        mockMemoryCache.Received(1).Remove($"session:{session.Id}");
    }

    [Test]
    public async Task SaveSession_Calls_Concrete_Repository_And_Removes_Cache()
    {
        var session = new Session(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, 
            "lastfm-key", "user", "music-token", "us");

        await cachingRepository.SaveSession(session);

        await mockConcreteRepository.Received(1).SaveSession(session);
        mockMemoryCache.Received(1).Remove($"session:{session.Id}");
    }

    [Test]
    public void Key_Method_Formats_Session_Id_Correctly()
    {
        // This tests the private Key method indirectly through SaveSession
        var sessionId = Guid.NewGuid();
        var session = new Session(sessionId, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, 
            null, null, null, null);

        cachingRepository.SaveSession(session);

        mockMemoryCache.Received(1).Remove($"session:{sessionId}");
    }
}

public class TestStationHub
{
    [Test]
    public void StationHub_Can_Be_Instantiated()
    {
        var hub = new StationHub();
        
        Assert.That(hub, Is.Not.Null);
    }
}