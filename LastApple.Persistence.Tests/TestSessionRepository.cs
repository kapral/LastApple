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
        // Arrange
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);
        
        // Act
        var repository = new SessionRepository(mockMongoClient, mockOptions);
        
        // Assert
        Assert.That(repository, Is.Not.Null);
        Assert.That(repository, Is.InstanceOf<ISessionRepository>());
    }

    [Test]
    public void SaveSession_Works_With_Valid_Session()
    {
        // Arrange
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

        // Act & Assert - Should not throw
        Assert.DoesNotThrowAsync(async () => await repository.SaveSession(session));
    }

    [Test]
    public void MongoConnectionDetails_Constructor_Sets_Properties()
    {
        // Arrange
        var connectionString = "mongodb://localhost:27017";
        var databaseName = "testdb";

        // Act
        var details = new MongoConnectionDetails(connectionString, databaseName);

        // Assert
        Assert.That(details.ConnectionString, Is.EqualTo(connectionString));
        Assert.That(details.DatabaseName, Is.EqualTo(databaseName));
    }

    [Test]
    public void MongoConnectionDetails_Default_Constructor_Sets_Empty_Values()
    {
        // Act
        var details = new MongoConnectionDetails();

        // Assert
        Assert.That(details.ConnectionString, Is.EqualTo(""));
        Assert.That(details.DatabaseName, Is.EqualTo(""));
    }
}