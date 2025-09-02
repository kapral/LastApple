using System.Collections.Generic;
using System.Linq;
using AppleMusicApi;
using LastApple.Model;
using LastApple.PlaylistGeneration;

namespace LastApple.Web.Tests;

public class TestArtistStationController
{
    private IStationRepository mockStationRepository;
    private ICatalogApi mockCatalogApi;
    private IStorefrontProvider mockStorefrontProvider;
    private ArtistStationController controller;

    [SetUp]
    public void Setup()
    {
        mockStationRepository  = Substitute.For<IStationRepository>();
        mockCatalogApi         = Substitute.For<ICatalogApi>();
        mockStorefrontProvider = Substitute.For<IStorefrontProvider>();

        controller = new ArtistStationController(mockStationRepository, mockCatalogApi, mockStorefrontProvider);
    }

    [Test]
    public async Task Create_Returns_Station_For_Single_Artist()
    {
        const string artistId       = "12345";
        const string storefront     = "us";
        var          artistResource = CreateMockArtist(artistId, ["album1", "album2"]);
        var albumResources = CreateMockAlbums([
            ("album1", ["song1", "song2"]),
            ("album2", ["song3", "song4"])
        ]);

        mockStorefrontProvider.GetStorefront().Returns(storefront);
        mockCatalogApi.GetArtist(artistId, storefront).Returns(artistResource);
        mockCatalogApi.GetAlbums(Arg.Any<IReadOnlyCollection<string>>(), storefront).Returns(albumResources);

        var station = await controller.Create(artistId);

        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsGroupedByAlbum, Is.True);
        Assert.That(station.Definition.Artists, Contains.Item(artistId));
        Assert.That(station.SongIds, Has.Count.EqualTo(4));
        mockStationRepository.Received(1).Create(Arg.Any<Station<ArtistsStationDefinition>>());
    }

    [Test]
    public async Task Create_Returns_Station_For_Multiple_Artists()
    {
        var artistIds = "12345,67890";
        var storefront = "us";

        var artist1 = CreateMockArtist("12345", ["album1"]);
        var artist2 = CreateMockArtist("67890", ["album2"]);
        var albums1 = CreateMockAlbums([("album1", ["song1", "song2"])]);
        var albums2 = CreateMockAlbums([("album2", ["song3", "song4"])]);

        mockStorefrontProvider.GetStorefront().Returns(storefront);
        mockCatalogApi.GetArtist("12345", storefront).Returns(artist1);
        mockCatalogApi.GetArtist("67890", storefront).Returns(artist2);
        mockCatalogApi.GetAlbums(Arg.Is<IReadOnlyCollection<string>>(x => x.Contains("album1")), storefront).Returns(albums1);
        mockCatalogApi.GetAlbums(Arg.Is<IReadOnlyCollection<string>>(x => x.Contains("album2")), storefront).Returns(albums2);

        var station = await controller.Create(artistIds);

        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsGroupedByAlbum, Is.False);
        Assert.That(station.Definition.Artists, Contains.Item("12345"));
        Assert.That(station.Definition.Artists, Contains.Item("67890"));
        Assert.That(station.SongIds, Has.Count.EqualTo(4));
    }

    private Resource<ArtistAttributes> CreateMockArtist(string artistId, string[] albumIds)
    {
        var albumData = albumIds.Select(id => new Resource<AlbumAttributes>(id, ResourceType.Albums, "", null!, null!)).ToArray();
        var albumsCollection = new ResourceMatches<AlbumAttributes>(albumData);
        var tracksCollection = new ResourceMatches<SongAttributes>(Array.Empty<Resource<SongAttributes>>());
        var relationships = new Relationships(tracksCollection, albumsCollection);

        return new Resource<ArtistAttributes>(artistId, ResourceType.Artists, "", null!, relationships);
    }

    private IReadOnlyCollection<Resource<AlbumAttributes>> CreateMockAlbums((string albumId, string[] trackIds)[] albumData)
    {
        return albumData.Select(album =>
        {
            var trackData = album.trackIds.Select(id => new Resource<SongAttributes>(id, ResourceType.Songs, "", null!, null!)).ToArray();
            var tracksCollection = new ResourceMatches<SongAttributes>(trackData);
            var albumsCollection = new ResourceMatches<AlbumAttributes>(Array.Empty<Resource<AlbumAttributes>>());
            var relationships = new Relationships(tracksCollection, albumsCollection);

            return new Resource<AlbumAttributes>(album.albumId, ResourceType.Albums, "", null!, relationships);
        }).ToArray();
    }
}