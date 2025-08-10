using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration;

public class TestStationGenerator
{
    private IStationTrackGenerator<SimilarArtistsStationDefinition> trackGenerator;
    private ITrackIdProvider trackIdProvider;
    private IStationEventMediator stationEventMediator;
    private IStationGenerator<SimilarArtistsStationDefinition> generator;

    [SetUp]
    public void Setup()
    {
        trackGenerator = Substitute.For<IStationTrackGenerator<SimilarArtistsStationDefinition>>();
        trackIdProvider = Substitute.For<ITrackIdProvider>();
        stationEventMediator = Substitute.For<IStationEventMediator>();

        generator = new StationGenerator<SimilarArtistsStationDefinition>(
            trackGenerator, 
            trackIdProvider, 
            stationEventMediator);
    }

    [Test]
    public void Constructor_Throws_On_Null_Arguments()
    {
        Assert.That(() => new StationGenerator<SimilarArtistsStationDefinition>(null, trackIdProvider, stationEventMediator), 
            Throws.ArgumentNullException);
        Assert.That(() => new StationGenerator<SimilarArtistsStationDefinition>(trackGenerator, null, stationEventMediator), 
            Throws.ArgumentNullException);
        Assert.That(() => new StationGenerator<SimilarArtistsStationDefinition>(trackGenerator, trackIdProvider, null), 
            Throws.ArgumentNullException);
    }

    [Test]
    public async Task Generate_Populates_Station_To_Target_Size()
    {
        var definition = new SimilarArtistsStationDefinition("Test Artist");
        var station = new Station<SimilarArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid(),
            Size = 3
        };

        trackGenerator.GetNext(definition)
                     .Returns(new Track(ArtistName: "Artist1", Name: "Track1"),
                             new Track(ArtistName: "Artist2", Name: "Track2"),
                             new Track(ArtistName: "Artist3", Name: "Track3"));

        trackIdProvider.FindTrackId("Artist1", "Track1", "us")
                      .Returns("track1");
        trackIdProvider.FindTrackId("Artist2", "Track2", "us")
                      .Returns("track2");
        trackIdProvider.FindTrackId("Artist3", "Track3", "us")
                      .Returns("track3");

        await generator.Generate(station, "us");

        Assert.That(station.SongIds.Count, Is.EqualTo(3));
        Assert.That(station.SongIds, Contains.Item("track1"));
        Assert.That(station.SongIds, Contains.Item("track2"));
        Assert.That(station.SongIds, Contains.Item("track3"));
    }

    [Test]
    public async Task Generate_Notifies_Event_Mediator_For_Each_Track()
    {
        var definition = new SimilarArtistsStationDefinition("Test Artist");
        var station = new Station<SimilarArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid(),
            Size = 2
        };

        trackGenerator.GetNext(definition)
                     .Returns(new Track(ArtistName: "Artist1", Name: "Track1"),
                             new Track(ArtistName: "Artist2", Name: "Track2"));

        trackIdProvider.FindTrackId(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                      .Returns("track1", "track2");

        await generator.Generate(station, "us");

        stationEventMediator.Received(1).NotifyTrackAdded(station.Id, "track1", 0);
        stationEventMediator.Received(1).NotifyTrackAdded(station.Id, "track2", 1);
    }

    [Test]
    public async Task Generate_Skips_Tracks_Without_Track_Id()
    {
        var definition = new SimilarArtistsStationDefinition("Test Artist");
        var station = new Station<SimilarArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid(),
            Size = 2
        };

        trackGenerator.GetNext(definition)
                     .Returns(new Track(ArtistName: "Artist1", Name: "Track1"),
                             new Track(ArtistName: "Artist2", Name: "Track2"),
                             new Track(ArtistName: "Artist3", Name: "Track3"));

        trackIdProvider.FindTrackId("Artist1", "Track1", "us")
                      .Returns((string)null);
        trackIdProvider.FindTrackId("Artist2", "Track2", "us")
                      .Returns("track2");
        trackIdProvider.FindTrackId("Artist3", "Track3", "us")
                      .Returns("track3");

        await generator.Generate(station, "us");

        Assert.That(station.SongIds.Count, Is.EqualTo(2));
        Assert.That(station.SongIds, Contains.Item("track2"));
        Assert.That(station.SongIds, Contains.Item("track3"));
        Assert.That(station.SongIds, Does.Not.Contain("track1"));
    }

    [Test]
    public async Task Generate_Skips_Duplicate_Track_Ids()
    {
        var definition = new SimilarArtistsStationDefinition("Test Artist");
        var station = new Station<SimilarArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid(),
            Size = 2
        };

        trackGenerator.GetNext(definition)
                     .Returns(new Track(ArtistName: "Artist1", Name: "Track1"),
                             new Track(ArtistName: "Artist2", Name: "Track2"),
                             new Track(ArtistName: "Artist3", Name: "Track3"));

        trackIdProvider.FindTrackId(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                      .Returns("duplicate_track", "duplicate_track", "track3");

        await generator.Generate(station, "us");

        Assert.That(station.SongIds.Count, Is.EqualTo(2));
        Assert.That(station.SongIds.Count(id => id == "duplicate_track"), Is.EqualTo(1));
        Assert.That(station.SongIds, Contains.Item("track3"));
    }

    [Test]
    public async Task TopUp_Adds_Specified_Number_Of_Tracks()
    {
        var definition = new SimilarArtistsStationDefinition("Test Artist");
        var station = new Station<SimilarArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid(),
            Size = 10
        };
        station.SongIds.Add("existing_track");

        trackGenerator.GetNext(definition)
                     .Returns(new Track(ArtistName: "Artist1", Name: "Track1"),
                             new Track(ArtistName: "Artist2", Name: "Track2"));

        trackIdProvider.FindTrackId(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                      .Returns("track1", "track2");

        await generator.TopUp(station, "us", 2);

        Assert.That(station.SongIds.Count, Is.EqualTo(3));
        Assert.That(station.SongIds, Contains.Item("existing_track"));
        Assert.That(station.SongIds, Contains.Item("track1"));
        Assert.That(station.SongIds, Contains.Item("track2"));
    }

    [Test]
    public async Task Generate_Stops_After_Attempts_Limit_When_No_Valid_Tracks()
    {
        var definition = new SimilarArtistsStationDefinition("Test Artist");
        var station = new Station<SimilarArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid(),
            Size = 5
        };

        trackGenerator.GetNext(definition)
                     .Returns((Track)null);

        await generator.Generate(station, "us");

        Assert.That(station.SongIds.Count, Is.EqualTo(0));
        await trackGenerator.Received(50).GetNext(definition);
    }
}