using System;
using System.Threading.Tasks;
using LastfmApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Controllers
{
    [Route("lastfm/auth")]
    public class LastfmAuthController : Controller
    {
        private readonly ILastfmApi _lastfmApi;
        private readonly ILastfmSessionProvider _sessionProvider;

        public LastfmAuthController(ILastfmApi lastfmApi, ILastfmSessionProvider sessionProvider)
        {
            _lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            _sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
        }

        [Route("")]
        public async Task<IActionResult> InitAuth(string redirectUrl)
        {
            if (!Uri.TryCreate(redirectUrl, UriKind.Absolute, out var uri))
                return BadRequest();

            var authUrl = await _lastfmApi.StartWebAuthentication(uri);

            return Json(authUrl.ToString());
        }

        [HttpPost]
        public async Task<IActionResult> CompleteAuth(string token)
        {
            var sessionKey = await _lastfmApi.CompleteAuthentication(token);

            var sessionId = Guid.NewGuid();

            _sessionProvider.AddKey(sessionId, sessionKey);

            Response.Cookies.Append("SessionId", sessionId.ToString(), new CookieOptions { Secure = true, HttpOnly = true });

            return NoContent();
        }

        [Route("state")]
        [ServiceFilter(typeof(LastfmAuthFilter))]
        public IActionResult IsAuthenticated()
        {
            return Json(_lastfmApi.IsAuthenticated);
        }
    }
}