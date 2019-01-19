using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Controllers
{
    [Route("songs")]
    public class SongsController : Controller
    {
        private readonly IDeveloperTokenProvider _tokenProvider;
        private readonly HttpClient              _httpClient;

        public SongsController(IDeveloperTokenProvider tokenProvider)
        {
            _tokenProvider = tokenProvider ?? throw new ArgumentNullException(nameof(tokenProvider));
            _httpClient    = new HttpClient { BaseAddress = new Uri("https://api.music.apple.com/v1/") };
        }

        [Route("{artistId}")]
        public async Task<IActionResult> GetSongs(string artistId)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _tokenProvider.GetToken());

            var httpResponse = await _httpClient.GetAsync($"catalog/ru/artists/{artistId}/songs");

            var response = await httpResponse.Content.ReadAsAsync<Response>();

            return Json(response.Data.Select(x => x.Id).ToArray());
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