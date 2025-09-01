using System;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Objects;
using LastApple.Web.Lastfm;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace LastApple.Web.Controllers;

[Route("api/lastfm/auth")]
public class LastfmAuthController(ILastAuth authApi,
                                  ISessionProvider sessionProvider,
                                  ISessionRepository sessionRepository,
                                  IUserApi userApi,
                                  IOptions<LastfmApiParams> apiParams,
                                  TimeProvider timeProvider) : Controller
{
    [Route("")]
    public IActionResult InitAuth(string redirectUrl)
    {
        if (!Uri.TryCreate(redirectUrl, UriKind.Absolute, out var uri))
            return BadRequest();

        var authUrl = GetWebAutUrl(uri);

        return Json(authUrl.ToString());
    }

    [HttpPost]
    public async Task<Guid> CompleteAuth(string token)
    {
        await authApi.GetSessionTokenAsync(token);

        var session = await sessionProvider.GetSession();
        var now = timeProvider.GetUtcNow();

        session = session.Id == Guid.Empty
            ? new Session(Guid.NewGuid(),
                          now,
                          now,
                          authApi.UserSession.Token,
                          authApi.UserSession.Username,
                          null,
                          null)
            : session with
            {
                LastActivityAt = now,
                LastfmSessionKey = authApi.UserSession.Token,
                LastfmUsername = authApi.UserSession.Username
            };

        await sessionRepository.SaveSession(session);

        return session.Id;
    }

    [HttpDelete]
    [Route("")]
    public async Task<IActionResult> Logout()
    {
        var session = await sessionProvider.GetSession();

        if (session.Id == Guid.Empty)
            return BadRequest();

        session = session with
        {
            LastfmSessionKey = null
        };

        await sessionRepository.SaveSession(session);

        return NoContent();
    }

    [Route("user")]
    public async Task<LastUser?> GetAuthenticatedUser()
    {
        var session = await sessionProvider.GetSession();

        if (string.IsNullOrWhiteSpace(session.LastfmSessionKey))
        {
            return null;
        }

        var userInfoResponse = await userApi.GetInfoAsync(session.LastfmUsername);

        return userInfoResponse.Content;
    }

    private Uri GetWebAutUrl(Uri redirectUrl)
        => new($"http://www.last.fm/api/auth?api_key={apiParams.Value.ApiKey}&cb={Uri.EscapeDataString(redirectUrl.ToString())}");
}