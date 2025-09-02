using System.Linq;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration;

public class TestCachingStationSource
{
    private ITrackRepository trackRepository;
    private IStationSource<SimilarArtistsStationDefinition> concreteSource;

    private IStationSource<SimilarArtistsStationDefinition> cachingSource;

    [SetUp]
    public void Init()
    {
        trackRepository = Substitute.For<ITrackRepository>();
        concreteSource  = Substitute.For<IStationSource<SimilarArtistsStationDefinition>>();

        cachingSource = new CachingStationSource<SimilarArtistsStationDefinition>(concreteSource, trackRepository);
    }

    [Test]
    public void Constructor_Throws_On_Null_Arguments()
    {
        Assert.That(() => new CachingStationSource<SimilarArtistsStationDefinition>(null!, trackRepository), Throws.ArgumentNullException);
        Assert.That(() => new CachingStationSource<SimilarArtistsStationDefinition>(concreteSource, null!), Throws.ArgumentNullException);
    }

    [Test]
    public void GetArtists_Throws_On_Null_Arguments()
    {
        Assert.That(() => cachingSource.GetStationArtists(null), Throws.ArgumentNullException);
    }

    [Test]
    public async Task Get_Artists_Loads_And_Caches_Station_Artists()
    {
        var artists = new[] { new Artist(Name: "Serdyuchka"), new Artist(Name: "Ictus") };
        var station = new SimilarArtistsStationDefinition("Kirkorow");

        concreteSource.GetStationArtists(station).Returns(artists);
        trackRepository.ArtistHasTracks(artists[0]).Returns(true);
        trackRepository.ArtistHasTracks(artists[1]).Returns(true);

        var result1 = await cachingSource.GetStationArtists(station);
        var result2 = await cachingSource.GetStationArtists(station);

        Assert.That(result1, Is.EqualTo(artists));
        Assert.That(result2, Is.EqualTo(artists));

        await concreteSource.Received(1).GetStationArtists(station);
    }

    [Test]
    public async Task Get_Artists_Filters_Out_Ones_With_Null_Cached_Tracks_After_Retries()
    {
        var artists = new[] { new Artist(Name: "Serdyuchka"), new Artist(Name: "Ictus") };
        var station = new SimilarArtistsStationDefinition("Kirkorow");

        concreteSource.GetStationArtists(station).Returns(artists);
        trackRepository.ArtistHasTracks(artists[0]).Returns(false);
        trackRepository.ArtistHasTracks(artists[1]).Returns(true);

        var result = await cachingSource.GetStationArtists(station);

        Assert.That(result, Is.EqualTo(artists.Skip(1)));
    }
}