using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using LastApple.Model;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/station/artist")]
    public class ArtistStationController : Controller
    {
        private readonly IDeveloperTokenProvider _tokenProvider;
        private readonly HttpClient              _httpClient;
        private readonly IStationRepository     _stationRepository;

        public ArtistStationController(IDeveloperTokenProvider tokenProvider, IStationRepository stationRepository)
        {
            _tokenProvider     = tokenProvider ?? throw new ArgumentNullException(nameof(tokenProvider));
            _stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
            _httpClient        = new HttpClient { BaseAddress = new Uri("https://api.music.apple.com/v1/") };
        }

        [HttpPost]
        [Route("{artistId}")]
        public async Task<ActionResult> Create(string artistId)
        {
            var station = new Station
            {
                Id = Guid.NewGuid()
            };

            var songs = await GetSongs(artistId);

            foreach (var song in songs)
                station.SongIds.Add(song);

            _stationRepository.Create(station);

            return Json(station.Id);
        }

        private async Task<IEnumerable<string>> GetSongs(string artistId)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _tokenProvider.GetToken());

            var httpResponse = await _httpClient.GetAsync($"catalog/ru/artists/{artistId}/songs");

            var response = await httpResponse.Content.ReadAsAsync<Response>();

            return response.Data.Select(x => x.Id).ToArray();
        }

        private class Response
        {
            public IEnumerable<Song> Data { get; set; }
        }

        private class Song
        {
            public string Id { get; set; }
        }
    }
}