using System;
using System.Threading.Tasks;
using LastApple;
using LastApple.Persistence;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Persistence.Tests;

public class TestSessionRepository
{
    [Test]
    public void Constructor_Accepts_Valid_Parameters()
    {
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);
        
        var repository = new SessionRepository(mockMongoClient, mockOptions);
        
        Assert.That(repository, Is.Not.Null);
        Assert.That(repository, Is.InstanceOf<ISessionRepository>());
    }

    [Test]
    public async Task GetSession_Calls_GetDatabase_With_Correct_Database_Name()
    {
        var sessionId = Guid.NewGuid();
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockDatabase = Substitute.For<IMongoDatabase>();
        
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);

        mockMongoClient.GetDatabase("testdb").Returns(mockDatabase);

        var repository = new SessionRepository(mockMongoClient, mockOptions);

        try
        {
            await repository.GetSession(sessionId);
        }
        catch
        {
            // Expected since we're not mocking the full chain
        }

        mockMongoClient.Received(1).GetDatabase("testdb");
    }

    [Test]
    public async Task SaveSession_Calls_GetDatabase_With_Correct_Database_Name()
    {
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockDatabase = Substitute.For<IMongoDatabase>();
        
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);

        mockMongoClient.GetDatabase("testdb").Returns(mockDatabase);

        var session = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow.AddHours(-1),
            LastActivityAt: DateTimeOffset.UtcNow.AddMinutes(-30),
            LastfmSessionKey: "lastfm-key",
            LastfmUsername: "testuser",
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );

        var repository = new SessionRepository(mockMongoClient, mockOptions);

        try
        {
            await repository.SaveSession(session);
        }
        catch
        {
            // Expected since we're not mocking the full chain
        }

        mockMongoClient.Received(1).GetDatabase("testdb");
    }

    [Test]
    public void SessionRepository_Implements_ISessionRepository_Interface()
    {
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);

        var repository = new SessionRepository(mockMongoClient, mockOptions);
        
        Assert.That(repository, Is.InstanceOf<ISessionRepository>());
    }
}