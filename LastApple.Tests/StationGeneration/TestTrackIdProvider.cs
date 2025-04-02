using System.Collections.Generic;
using System.Threading.Tasks;
using AppleMusicApi;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration;

public class TestTrackIdProvider
{
    private ICatalogApi catalogApi;

    private ITrackIdProvider trackIdProvider;

    [SetUp]
    public void Init()
    {
        catalogApi         = Substitute.For<ICatalogApi>();

        trackIdProvider = new TrackIdProvider(catalogApi);
    }

    [Test]
    public async Task FindTrackId_Returns_First_Found_Track()
    {
        const string artist = "Shortparis";
        const string track  = "Amsterdam";

        var relationships = new Relationships(new ResourceMatches<SongAttributes>(new List<Resource<SongAttributes>>()), new ResourceMatches<AlbumAttributes>(new List<Resource<AlbumAttributes>>()));
        var song          = new Resource<SongAttributes>(Id: "song-123", ResourceType.Songs, "", new SongAttributes(), relationships);

        catalogApi.Search(Arg.Is<SearchParams>(x => x.Term.Equals($"{artist} - {track}") && x.Types == ResourceType.Songs && x.Limit == 1), "ua")
                  .Returns(new SearchResult(new ResourceMatches<ArtistAttributes>(new List<Resource<ArtistAttributes>>()),
                                            new ResourceMatches<AlbumAttributes>(new List<Resource<AlbumAttributes>>()),
                                            new ResourceMatches<SongAttributes>(new List<Resource<SongAttributes>> { song })));

        var id = await trackIdProvider.FindTrackId(artist, track, "ua");

        Assert.That(id, Is.EqualTo(song.Id));
    }

    [Test]
    public async Task FindTrackId_Returns_Null_If_Not_Found()
    {
        const string artist = "Shortparis";
        const string track  = "Amsterdam";

        catalogApi.Search(Arg.Is<SearchParams>(x => x.Term.Equals($"{artist} - {track}") && x.Types == ResourceType.Songs && x.Limit == 1), "ua")
                  .Returns(new SearchResult(new ResourceMatches<ArtistAttributes>(new List<Resource<ArtistAttributes>>()),
                                            new ResourceMatches<AlbumAttributes>(new List<Resource<AlbumAttributes>>()),
                                            new ResourceMatches<SongAttributes>(new List<Resource<SongAttributes>>())));

        var id = await trackIdProvider.FindTrackId(artist, track, "ua");

        Assert.That(id, Is.Null);
    }

    [Test]
    public async Task FindTrackId_Returns_Null_If_Songs_Property_Is_Null()
    {
        const string artist = "Shortparis";
        const string track  = "Amsterdam";

        catalogApi.Search(Arg.Is<SearchParams>(x => x.Term.Equals($"{artist} - {track}") && x.Types == ResourceType.Songs && x.Limit == 1), "ua")
                  .Returns(new SearchResult(Artists: new ResourceMatches<ArtistAttributes>(new List<Resource<ArtistAttributes>>()),
                                            Albums: new ResourceMatches<AlbumAttributes>(new List<Resource<AlbumAttributes>>()),
                                            Songs: null));

        var id = await trackIdProvider.FindTrackId(artist, track, "ua");

        Assert.That(id, Is.Null);
    }
}