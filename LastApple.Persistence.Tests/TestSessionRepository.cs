using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using NSubstitute;

namespace LastApple.Persistence.Tests;

public class TestSessionRepository
{
    [Test]
    public async Task GetSession_Calls_GetDatabase_With_Correct_Database_Name()
    {
        var session = new Model.Session
        {
            Id                = Guid.NewGuid(),
            LastActivityAt    = DateTimeOffset.Now,
            LastfmUsername    = "testuser",
            LastfmSessionKey  = "lastfm-key",
            MusicStorefrontId = "us",
            MusicUserToken    = "music-token",
            StartedAt         = DateTimeOffset.Now.AddHours(-1)
        };
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockDatabase    = Substitute.For<IMongoDatabase>();
        var collection      = Substitute.For<IMongoCollection<Model.Session>>();

        var cursor = Substitute.For<IAsyncCursor<Model.Session>>();
        cursor.MoveNextAsync().Returns(true, false);
        cursor.Current.Returns([session]);

        mockDatabase.GetCollection<Model.Session>("sessions").Returns(collection);
        collection.FindAsync(Arg.Any<FilterDefinition<Model.Session>>(), Arg.Any<FindOptions<Model.Session, Model.Session>>(), CancellationToken.None).Returns(cursor);

        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);

        mockMongoClient.GetDatabase("testdb").Returns(mockDatabase);

        var repository = new SessionRepository(mockMongoClient, mockOptions);

        var result = await repository.GetSession(session.Id);

        Assert.That(result.Id, Is.EqualTo(session.Id));
        Assert.That(result.LastActivityAt, Is.EqualTo(session.LastActivityAt));
        Assert.That(result.LastfmUsername, Is.EqualTo(session.LastfmUsername));
        Assert.That(result.LastfmSessionKey, Is.EqualTo(session.LastfmSessionKey));
        Assert.That(result.MusicStorefrontId, Is.EqualTo(session.MusicStorefrontId));
        Assert.That(result.MusicUserToken, Is.EqualTo(session.MusicUserToken));
        Assert.That(result.StartedAt, Is.EqualTo(session.StartedAt));
    }

    [Test]
    public async Task SaveSession_Calls_GetDatabase_With_Correct_Database_Name()
    {
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockDatabase    = Substitute.For<IMongoDatabase>();
        var collection      = Substitute.For<IMongoCollection<Model.Session>>();

        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        mockOptions.Value.Returns(connectionDetails);

        mockMongoClient.GetDatabase("testdb").Returns(mockDatabase);
        mockDatabase.GetCollection<Model.Session>("sessions").Returns(collection);
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
        await repository.SaveSession(session);

        await collection.Received()
                        .ReplaceOneAsync(Arg.Any<FilterDefinition<Model.Session>>(),
                                         Arg.Is<Model.Session>(s => s.Id == session.Id),
                                         Arg.Any<ReplaceOptions>(),
                                         CancellationToken.None);
    }
}