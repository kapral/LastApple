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
    public void SaveSession_Works_With_Valid_Session()
    {
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);
        var repository = new SessionRepository(mockMongoClient, mockOptions);
        
        var session = new Session(
            Id: Guid.NewGuid(),
            StartedAt: DateTimeOffset.UtcNow.AddHours(-1),
            LastActivityAt: DateTimeOffset.UtcNow.AddMinutes(-30),
            LastfmSessionKey: "lastfm-key",
            LastfmUsername: "testuser",
            MusicUserToken: "music-token",
            MusicStorefrontId: "us"
        );

        Assert.DoesNotThrowAsync(async () => await repository.SaveSession(session));
    }

    [Test]
    public void MongoConnectionDetails_Constructor_Sets_Properties()
    {
        var connectionString = "mongodb://localhost:27017";
        var databaseName = "testdb";

        var details = new MongoConnectionDetails(connectionString, databaseName);

        Assert.That(details.ConnectionString, Is.EqualTo(connectionString));
        Assert.That(details.DatabaseName, Is.EqualTo(databaseName));
    }

    [Test]
    public void MongoConnectionDetails_Default_Constructor_Sets_Empty_Values()
    {
        var details = new MongoConnectionDetails();

        Assert.That(details.ConnectionString, Is.EqualTo(""));
        Assert.That(details.DatabaseName, Is.EqualTo(""));
    }
}