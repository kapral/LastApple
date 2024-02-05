using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppleMusicApi;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/artist")]
public class ArtistStationController(IStationRepository stationRepository,
                                     ICatalogApi catalogApi,
                                     IStorefrontProvider storefrontProvider) : Controller
{
    private readonly IStationRepository  stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
    private readonly ICatalogApi         catalogApi = catalogApi ?? throw new ArgumentNullException(nameof(catalogApi));
    private readonly IStorefrontProvider storefrontProvider = storefrontProvider ?? throw new ArgumentNullException(nameof(storefrontProvider));

    [HttpPost]
    [Route("{artistId}")]
    public async Task<ActionResult> Create(string artistId)
    {
        var definition = new ArtistsStationDefinition { Artists = { artistId } };
        var station = new Station<ArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid()
        };

        var songs = await GetSongs(artistId);

        foreach (var song in songs)
            station.SongIds.Add(song);

        stationRepository.Create(station);

        return Json(station);
    }

    private async Task<IEnumerable<string>> GetSongs(string artistId)
    {
        var storefront = await storefrontProvider.GetStorefront();
        var artist     = await catalogApi.GetArtist(artistId, storefront) ?? throw new InvalidOperationException($"Artist {artistId} was not found.");
        var albumIds   = artist.Relationships.Albums.Data.Select(x => x.Id);
        var albums     = await catalogApi.GetAlbums(albumIds, storefront);

        return albums.SelectMany(x => x.Relationships.Tracks.Data.Select(t => t.Id));
    }
}