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