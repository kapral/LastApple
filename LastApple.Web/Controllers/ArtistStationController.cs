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
    [HttpPost]
    [Route("{joinedIds}")]
    public async Task<ActionResult> Create(string joinedIds)
    {
        var definition = new ArtistsStationDefinition();
        var artistIds = joinedIds.Split(',').Select(x => x.Trim()).ToArray();

        foreach (var artistId in artistIds)
        {
            definition.Artists.Add(artistId);
        }

        var station = new Station<ArtistsStationDefinition>(definition)
        {
            Id = Guid.NewGuid(),
            IsGroupedByAlbum = artistIds.Length == 1
        };

        var allSongs = new List<string>();

        foreach (var artistId in artistIds)
        {
            var songs = await GetSongs(artistId);

            allSongs.AddRange(songs);
        }

        station.SongIds.AddRange(allSongs.OrderBy(_ => Guid.NewGuid()));

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