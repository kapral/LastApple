using System;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using NUnit.Framework;

namespace LastApple.Tests;

public class TestStationRepository
{
    private IStationRepository repository;

    [SetUp]
    public void Setup()
    {
        repository = new StationRepository();
    }

    [Test]
    public void Get_Returns_Null_For_NonExistent_Station()
    {
        var nonExistentId = Guid.NewGuid();

        var result = repository.Get(nonExistentId);

        Assert.That(result, Is.Null);
    }

    [Test]
    public void Create_And_Get_Station_Works()
    {
        var stationId = Guid.NewGuid();
        var definition = new ArtistsStationDefinition();
        var station = new Station<ArtistsStationDefinition>(definition)
        {
            Id = stationId,
            Size = 15
        };

        repository.Create(station);
        var result = repository.Get(stationId);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(stationId));
        Assert.That(result.Size, Is.EqualTo(15));
    }

    [Test]
    public void Create_Overwrites_Existing_Station()
    {
        var stationId = Guid.NewGuid();
        var definition1 = new ArtistsStationDefinition();
        var station1 = new Station<ArtistsStationDefinition>(definition1)
        {
            Id = stationId,
            Size = 10
        };
        
        var definition2 = new ArtistsStationDefinition();
        var station2 = new Station<ArtistsStationDefinition>(definition2)
        {
            Id = stationId,
            Size = 20
        };

        repository.Create(station1);
        repository.Create(station2);
        var result = repository.Get(stationId);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Size, Is.EqualTo(20));
    }

    [Test]
    public void Create_Allows_Multiple_Different_Stations()
    {
        var station1Id = Guid.NewGuid();
        var station2Id = Guid.NewGuid();
        var definition = new ArtistsStationDefinition();
        
        var station1 = new Station<ArtistsStationDefinition>(definition)
        {
            Id = station1Id,
            Size = 10
        };
        
        var station2 = new Station<ArtistsStationDefinition>(definition)
        {
            Id = station2Id,
            Size = 15
        };

        repository.Create(station1);
        repository.Create(station2);

        var result1 = repository.Get(station1Id);
        var result2 = repository.Get(station2Id);

        Assert.That(result1, Is.Not.Null);
        Assert.That(result2, Is.Not.Null);
        Assert.That(result1.Id, Is.EqualTo(station1Id));
        Assert.That(result2.Id, Is.EqualTo(station2Id));
        Assert.That(result1.Size, Is.EqualTo(10));
        Assert.That(result2.Size, Is.EqualTo(15));
    }
}