using System;
using System.Threading.Tasks;
using LastfmApi;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/lastfm/auth")]
    public class LastfmAuthController : Controller
    {
        private readonly ILastfmApi         lastfmApi;
        private readonly ISessionProvider   sessionProvider;
        private readonly ISessionRepository sessionRepository;

        public LastfmAuthController(ILastfmApi lastfmApi,
            ISessionProvider sessionProvider,
            ISessionRepository sessionRepository)
        {
            this.lastfmApi         = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            this.sessionProvider   = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
            this.sessionRepository = sessionRepository ?? throw new ArgumentNullException(nameof(sessionRepository));
        }

        [Route("")]
        public async Task<IActionResult> InitAuth(string redirectUrl)
        {
            if (!Uri.TryCreate(redirectUrl, UriKind.Absolute, out var uri))
                return BadRequest();

            var authUrl = await lastfmApi.StartWebAuthentication(uri);

            return Json(authUrl.ToString());
        }

        [HttpPost]
        public async Task<IActionResult> CompleteAuth(string token)
        {
            var sessionKey = await lastfmApi.CompleteAuthentication(token);
            var session    = await sessionProvider.GetSession() ?? new Session { Id = Guid.NewGuid() };

            session.LastfmSessionKey = sessionKey;

            await sessionRepository.SaveSession(session);

            return Json(session.Id);
        }
        
        [HttpDelete]
        [Route("")]
        public async Task<IActionResult> Logout()
        {
            var session    = await sessionProvider.GetSession() ?? new Session { Id = Guid.NewGuid() };

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

            return Json(await lastfmApi.GetUserInfo(session.LastfmSessionKey));
        }
    }
}