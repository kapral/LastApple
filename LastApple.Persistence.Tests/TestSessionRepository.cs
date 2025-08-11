using System;
using System.Collections.Generic;
using System.Threading;
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
    public async Task GetSession_Returns_Session_From_Database()
    {
        var sessionId = Guid.NewGuid();
        var expectedSession = new Session(sessionId, DateTimeOffset.Now, DateTimeOffset.Now, null, "testuser", null, null);
        
        var mockCollection = Substitute.For<IMongoCollection<Session>>();
        var mockDatabase = Substitute.For<IMongoDatabase>();
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        
        mockOptions.Value.Returns(connectionDetails);
        mockMongoClient.GetDatabase("testdb").Returns(mockDatabase);
        mockDatabase.GetCollection<Session>("Sessions").Returns(mockCollection);
        
        var mockCursor = Substitute.For<IAsyncCursor<Session>>();
        mockCursor.MoveNextAsync(Arg.Any<CancellationToken>()).Returns(Task.FromResult(true), Task.FromResult(false));
        mockCursor.Current.Returns(new List<Session> { expectedSession });
        mockCollection.FindAsync(Arg.Any<FilterDefinition<Session>>(), Arg.Any<FindOptions<Session>>(), Arg.Any<CancellationToken>()).Returns(mockCursor);
        
        var repository = new SessionRepository(mockMongoClient, mockOptions);
        var result = await repository.GetSession(sessionId);
        
        Assert.That(result.Id, Is.EqualTo(sessionId));
        Assert.That(result.LastfmUsername, Is.EqualTo("testuser"));
    }

    [Test]
    public async Task SaveSession_Saves_Session_To_Database()
    {
        var session = new Session(Guid.NewGuid(), DateTimeOffset.Now, DateTimeOffset.Now, null, "testuser", null, null);
        
        var mockCollection = Substitute.For<IMongoCollection<Session>>();
        var mockDatabase = Substitute.For<IMongoDatabase>();
        var mockMongoClient = Substitute.For<IMongoClient>();
        var mockOptions = Substitute.For<IOptions<MongoConnectionDetails>>();
        var connectionDetails = new MongoConnectionDetails("mongodb://localhost:27017", "testdb");
        
        mockOptions.Value.Returns(connectionDetails);
        mockMongoClient.GetDatabase("testdb").Returns(mockDatabase);
        mockDatabase.GetCollection<Session>("Sessions").Returns(mockCollection);
        
        var repository = new SessionRepository(mockMongoClient, mockOptions);
        await repository.SaveSession(session);
        
        await mockCollection.Received(1).ReplaceOneAsync(
            Arg.Any<FilterDefinition<Session>>(),
            session,
            Arg.Any<ReplaceOptions>(),
            Arg.Any<CancellationToken>()
        );
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