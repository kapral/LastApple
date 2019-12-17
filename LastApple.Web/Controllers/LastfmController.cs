using System;
using System.Threading.Tasks;
using LastfmApi;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/lastfm")]
    public class LastfmController : Controller
    {
        private readonly ILastfmApi lastfmApi;
        private readonly ISessionProvider sessionProvider;

        public LastfmController(ILastfmApi lastfmApi, ISessionProvider sessionProvider)
        {
            this.lastfmApi       = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            this.sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
        }

        [HttpGet]
        [Route("artist/search")]
        public async Task<IActionResult> Search(string term)
        {
            if (string.IsNullOrWhiteSpace(term)) throw new ArgumentException(nameof(term));

            var results = await lastfmApi.SearchArtists(term);

            return Json(results);
        }

        [HttpPost]
        [Route("scrobble")]
        public async Task<IActionResult> Scrobble(string artist, string song)
        {
            var validationResponse = Validate(artist, song);

            if (validationResponse != null)
                return validationResponse;

            var sessionKey = await GetSessionKey();

            if (string.IsNullOrWhiteSpace(sessionKey))
                return Unauthorized();

            await lastfmApi.Scrobble(artist, song, sessionKey);

            return NoContent();
        }

        [HttpPost]
        [Route("nowplaying")]
        public async Task<IActionResult> NowPlaying(string artist, string song)
        {
            var validationResponse = Validate(artist, song);

            if (validationResponse != null)
                return validationResponse;

            var sessionKey = await GetSessionKey();

            if (string.IsNullOrWhiteSpace(sessionKey))
                return Unauthorized();

            await lastfmApi.NowPlaying(artist, song, TimeSpan.FromMinutes(3), sessionKey);

            return NoContent();
        }

        private IActionResult Validate(string artist, string song)
        {
            if (string.IsNullOrWhiteSpace(artist))
                return BadRequest($"{nameof(artist)} is empty.");

            if (string.IsNullOrWhiteSpace(song))
                return BadRequest($"{nameof(song)} is empty.");

            return null;
        }

        private async Task<string> GetSessionKey()
        {
            return (await sessionProvider.GetSession())?.LastfmSessionKey;
        }
    }
}