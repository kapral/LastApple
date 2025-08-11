using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppleMusicApi;
using LastApple;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastApple.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NUnit.Framework;

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
        mockStationRepository = Substitute.For<IStationRepository>();
        mockCatalogApi = Substitute.For<ICatalogApi>();
        mockStorefrontProvider = Substitute.For<IStorefrontProvider>();
        controller = new ArtistStationController(mockStationRepository, mockCatalogApi, mockStorefrontProvider);
    }

    [Test]
    public async Task Create_Returns_Station_For_Single_Artist()
    {
        var artistId = "12345";
        var storefront = "us";
        var artistResource = CreateMockArtist(artistId, new[] { "album1", "album2" });
        var albumResources = CreateMockAlbums(new[]
        {
            ("album1", new[] { "song1", "song2" }),
            ("album2", new[] { "song3", "song4" })
        });

        mockStorefrontProvider.GetStorefront().Returns(storefront);
        mockCatalogApi.GetArtist(artistId, storefront).Returns(artistResource);
        mockCatalogApi.GetAlbums(Arg.Any<IEnumerable<string>>(), storefront).Returns(albumResources);

        var result = await controller.Create(artistId);

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        var station = jsonResult.Value as Station<ArtistsStationDefinition>;
        
        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsGroupedByAlbum, Is.True); // Single artist should be grouped by album
        Assert.That(station.Definition.Artists, Contains.Item(artistId));
        Assert.That(station.SongIds, Has.Count.EqualTo(4));
        mockStationRepository.Received(1).Create(Arg.Any<Station<ArtistsStationDefinition>>());
    }

    [Test]
    public async Task Create_Returns_Station_For_Multiple_Artists()
    {
        var artistIds = "12345,67890";
        var storefront = "us";
        
        var artist1 = CreateMockArtist("12345", new[] { "album1" });
        var artist2 = CreateMockArtist("67890", new[] { "album2" });
        var albums1 = CreateMockAlbums(new[] { ("album1", new[] { "song1", "song2" }) });
        var albums2 = CreateMockAlbums(new[] { ("album2", new[] { "song3", "song4" }) });

        mockStorefrontProvider.GetStorefront().Returns(storefront);
        mockCatalogApi.GetArtist("12345", storefront).Returns(artist1);
        mockCatalogApi.GetArtist("67890", storefront).Returns(artist2);
        mockCatalogApi.GetAlbums(Arg.Is<IEnumerable<string>>(x => x.Contains("album1")), storefront).Returns(albums1);
        mockCatalogApi.GetAlbums(Arg.Is<IEnumerable<string>>(x => x.Contains("album2")), storefront).Returns(albums2);

        var result = await controller.Create(artistIds);

        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        var station = jsonResult.Value as Station<ArtistsStationDefinition>;
        
        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsGroupedByAlbum, Is.False); // Multiple artists should not be grouped by album
        Assert.That(station.Definition.Artists, Contains.Item("12345"));
        Assert.That(station.Definition.Artists, Contains.Item("67890"));
        Assert.That(station.SongIds, Has.Count.EqualTo(4));
    }

    [Test]
    public void Create_Throws_When_Artist_Not_Found()
    {
        var artistId = "invalid";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);
        mockCatalogApi.GetArtist(artistId, storefront).Returns((Resource<ArtistAttributes>)null);

        Assert.ThrowsAsync<InvalidOperationException>(async () => await controller.Create(artistId));
    }

    [Test]
    public async Task Create_Handles_Empty_Artist_ID()
    {
        var artistIds = " , ";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        Assert.ThrowsAsync<InvalidOperationException>(async () => await controller.Create(artistIds));
    }

    private Resource<ArtistAttributes> CreateMockArtist(string artistId, string[] albumIds)
    {
        var albumData = albumIds.Select(id => new Resource<AlbumAttributes>(id, ResourceType.Albums, "", null, null)).ToArray();
        var albumsCollection = new ResourceMatches<AlbumAttributes>(albumData);
        var tracksCollection = new ResourceMatches<SongAttributes>(Array.Empty<Resource<SongAttributes>>());
        var relationships = new Relationships(tracksCollection, albumsCollection);

        return new Resource<ArtistAttributes>(artistId, ResourceType.Artists, "", null, relationships);
    }

    private IEnumerable<Resource<AlbumAttributes>> CreateMockAlbums((string albumId, string[] trackIds)[] albumData)
    {
        return albumData.Select(album =>
        {
            var trackData = album.trackIds.Select(id => new Resource<SongAttributes>(id, ResourceType.Songs, "", null, null)).ToArray();
            var tracksCollection = new ResourceMatches<SongAttributes>(trackData);
            var albumsCollection = new ResourceMatches<AlbumAttributes>(Array.Empty<Resource<AlbumAttributes>>());
            var relationships = new Relationships(tracksCollection, albumsCollection);

            return new Resource<AlbumAttributes>(album.albumId, ResourceType.Albums, "", null, relationships);
        });
    }
}