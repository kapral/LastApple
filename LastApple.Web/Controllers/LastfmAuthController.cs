using System;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Web.Lastfm;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace LastApple.Web.Controllers;

[Route("api/lastfm/auth")]
public class LastfmAuthController : Controller
{
    private readonly ILastAuth authApi;
    private readonly IUserApi userApi;
    private readonly ISessionProvider sessionProvider;
    private readonly ISessionRepository sessionRepository;
    private readonly IOptions<LastfmApiParams> apiParams;

    public LastfmAuthController(
        ILastAuth authApi,
        ISessionProvider sessionProvider,
        ISessionRepository sessionRepository,
        IUserApi userApi,
        IOptions<LastfmApiParams> apiParams)
    {
        this.authApi           = authApi ?? throw new ArgumentNullException(nameof(authApi));
        this.sessionProvider   = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
        this.sessionRepository = sessionRepository ?? throw new ArgumentNullException(nameof(sessionRepository));
        this.userApi           = userApi ?? throw new ArgumentNullException(nameof(userApi));
        this.apiParams         = apiParams ?? throw new ArgumentNullException(nameof(apiParams));
    }

    [Route("")]
    public IActionResult InitAuth(string redirectUrl)
    {
        if (!Uri.TryCreate(redirectUrl, UriKind.Absolute, out var uri))
            return BadRequest();

        var authUrl = GetWebAutUrl(uri);

        return Json(authUrl.ToString());
    }

    [HttpPost]
    public async Task<IActionResult> CompleteAuth(string token)
    {
        await authApi.GetSessionTokenAsync(token);

        var session = await sessionProvider.GetSession() ?? new Session { Id = Guid.NewGuid() };

        session.LastfmSessionKey = authApi.UserSession.Token;
        session.LastfmUsername   = authApi.UserSession.Username;

        await sessionRepository.SaveSession(session);

        return Json(session.Id);
    }

    [HttpDelete]
    [Route("")]
    public async Task<IActionResult> Logout()
    {
        var session = await sessionProvider.GetSession() ?? new Session { Id = Guid.NewGuid() };

        session.LastfmSessionKey = null;

        await sessionRepository.SaveSession(session);

        return NoContent();
    }

    [Route("user")]
    public async Task<IActionResult> GetAuthenticatedUser()
    {
        var session = await sessionProvider.GetSession();

        if (string.IsNullOrWhiteSpace(session?.LastfmSessionKey))
            return Json(null);

        var userInfoResponse = await userApi.GetInfoAsync(session.LastfmUsername);

        return Json(userInfoResponse.Content);
    }

    private Uri GetWebAutUrl(Uri redirectUrl)
    {
        return new Uri($"http://www.last.fm/api/auth?api_key={apiParams.Value.ApiKey}&cb={Uri.EscapeDataString(redirectUrl.ToString())}");
    }
}