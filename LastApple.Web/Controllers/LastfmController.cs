using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Objects;
using IF.Lastfm.Core.Scrobblers;
using LastApple.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/lastfm")]
public class LastfmController(ISessionProvider sessionProvider,
                              IScrobbler scrobbler,
                              IArtistApi artistApi,
                              ITrackApi trackApi,
                              ILastAuth lastAuth) : Controller
{
    [HttpGet]
    [Route("artist/search")]
    public async Task<IReadOnlyCollection<LastArtist>> Search(string term)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(term);

        var results = await artistApi.SearchAsync(term);

        return results.Content;
    }

    [HttpPost]
    [Route("scrobble")]
    public async Task<IActionResult> Scrobble([FromBody] ScrobbleRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var validationResponse = Validate(request.Artist, request.Song);

        if (validationResponse != null)
            return validationResponse;

        var sessionKey = await GetSessionKey();

        if (string.IsNullOrWhiteSpace(sessionKey))
            return Unauthorized();

        lastAuth.LoadSession(new LastUserSession { Token = sessionKey });

        var scrobble = new Scrobble(request.Artist, request.Album, request.Song, DateTimeOffset.Now)
        {
            Duration = TimeSpan.FromMilliseconds(request.DurationInMillis)
        };

        await scrobbler.ScrobbleAsync(scrobble);

        return NoContent();
    }

    [HttpPost]
    [Route("nowplaying")]
    public async Task<IActionResult> NowPlaying([FromBody] ScrobbleRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var validationResponse = Validate(request.Artist, request.Song);

        if (validationResponse != null)
            return validationResponse;

        var sessionKey = await GetSessionKey();

        if (string.IsNullOrWhiteSpace(sessionKey))
            return Unauthorized();

        lastAuth.LoadSession(new LastUserSession { Token = sessionKey });

        var scrobble = new Scrobble(request.Artist, request.Album, request.Song, DateTimeOffset.Now)
        {
            Duration = TimeSpan.FromMilliseconds(request.DurationInMillis)
        };

        await trackApi.UpdateNowPlayingAsync(scrobble);

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
        => (await sessionProvider.GetSession()).LastfmSessionKey;
}