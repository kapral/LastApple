using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppleMusicApi;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/station/artist")]
    public class ArtistStationController : Controller
    {
        private readonly IStationRepository _stationRepository;
        private readonly ICatalogApi        _catalogApi;

        public ArtistStationController(IStationRepository stationRepository, ICatalogApi catalogApi)
        {
            _stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
            _catalogApi        = catalogApi;
        }

        [HttpPost]
        [Route("{artistId}")]
        public async Task<ActionResult> Create(string artistId)
        {
            var station = new Station<ArtistsStationDefinition>
            {
                Id = Guid.NewGuid()
            };

            var songs = await GetSongs(artistId);

            foreach (var song in songs)
                station.SongIds.Add(song);

            _stationRepository.Create(station);

            return Json(station);
        }

        private async Task<IEnumerable<string>> GetSongs(string artistId)
        {
            var artist   = await _catalogApi.GetArtist(artistId);
            var albumIds = artist.Relationships.Albums.Data.Select(x => x.Id);
            var albums   = await _catalogApi.GetAlbums(albumIds);

            return albums.SelectMany(x => x.Relationships.Tracks.Data.Select(t => t.Id));
        }
    }
}