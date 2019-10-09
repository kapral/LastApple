using System;
using System.Reflection.Metadata;
using System.Threading.Tasks;
using LastfmApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/lastfm/auth")]
    public class LastfmAuthController : Controller
    {
        private readonly ILastfmApi         _lastfmApi;
        private readonly ISessionProvider   _sessionProvider;
        private readonly ISessionRepository _sessionRepository;

        public LastfmAuthController(ILastfmApi lastfmApi, ISessionProvider sessionProvider,
            ISessionRepository sessionRepository)
        {
            _lastfmApi         = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            _sessionProvider   = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
            _sessionRepository = sessionRepository;
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

            var session = _sessionProvider.Session ?? new Session { Id = Guid.NewGuid() };

            session.LastfmSessionKey = sessionKey;

            _sessionRepository.SaveSession(session);

            return Json(session.Id);
        }

        [Route("user")]
        public async Task<IActionResult> GetAuthenticatedUser()
        {
            if (!_lastfmApi.IsAuthenticated)
                return Json(null);

            return Json(await _lastfmApi.GetUserInfo());
        }
    }
}