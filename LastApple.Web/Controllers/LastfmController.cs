using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Objects;
using IF.Lastfm.Core.Scrobblers;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/lastfm")]
public class LastfmController(ISessionProvider sessionProvider,
                              IScrobbler scrobbler,
                              IArtistApi artistApi,
                              ITrackApi trackApi,
                              ILastAuth lastAuth) : Controller
{
    private readonly IScrobbler scrobbler = scrobbler ?? throw new ArgumentNullException(nameof(scrobbler));
    private readonly IArtistApi artistApi = artistApi ?? throw new ArgumentNullException(nameof(artistApi));
    private readonly ITrackApi trackApi = trackApi ?? throw new ArgumentNullException(nameof(trackApi));
    private readonly ILastAuth lastAuth = lastAuth ?? throw new ArgumentNullException(nameof(lastAuth));
    private readonly ISessionProvider sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));

    [HttpGet]
    [Route("artist/search")]
    public async Task<IActionResult> Search(string term)
    {
        if (string.IsNullOrWhiteSpace(term)) throw new ArgumentException(nameof(term));

        var results = await artistApi.SearchAsync(term);

        return Json(results.Content ?? new List<LastArtist>());
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

        lastAuth.LoadSession(new LastUserSession { Token = sessionKey });

        await scrobbler.ScrobbleAsync(new Scrobble(artist, string.Empty, song, DateTimeOffset.Now));

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

        lastAuth.LoadSession(new LastUserSession { Token = sessionKey });

        await trackApi.UpdateNowPlayingAsync(new Scrobble(artist, string.Empty, song, DateTimeOffset.Now) { Duration = TimeSpan.FromMinutes(3) });

        return NoContent();
    }

    private IActionResult? Validate(string artist, string song)
    {
        if (string.IsNullOrWhiteSpace(artist))
            return BadRequest($"{nameof(artist)} is empty.");

        if (string.IsNullOrWhiteSpace(song))
            return BadRequest($"{nameof(song)} is empty.");

        return null;
    }

    private async Task<string?> GetSessionKey()
    {
        return (await sessionProvider.GetSession()).LastfmSessionKey;
    }
}