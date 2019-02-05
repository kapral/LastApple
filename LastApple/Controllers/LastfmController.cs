using System;
using System.Threading.Tasks;
using LastfmApi;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Controllers
{
    [Route("lastfm")]
    [ServiceFilter(typeof(LastfmAuthFilter))]
    public class LastfmController : Controller
    {
        private readonly ILastfmApi _lastfmApi;

        public LastfmController(ILastfmApi lastfmApi)
        {
            _lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        [HttpPost]
        [Route("scrobble")]
        public async Task<IActionResult> Scrobble(string artist, string song)
        {
            var validationResponse = Validate(artist, song);

            if (validationResponse != null)
                return validationResponse;

            await _lastfmApi.Scrobble(artist, song);

            return NoContent();
        }

        [HttpPost]
        [Route("nowplaying")]
        public async Task<IActionResult> NowPlaying(string artist, string song)
        {
            var validationResponse = Validate(artist, song);

            if (validationResponse != null)
                return validationResponse;

            await _lastfmApi.NowPlaying(artist, song, TimeSpan.FromMinutes(3));

            return NoContent();
        }

        private IActionResult Validate(string artist, string song)
        {
            if (string.IsNullOrWhiteSpace(artist))
                return BadRequest($"{nameof(artist)} is empty.");

            if (string.IsNullOrWhiteSpace(song))
                return BadRequest($"{nameof(song)} is empty.");

            if (!_lastfmApi.IsAuthenticated)
                return Unauthorized();

            return null;
        }
    }
}