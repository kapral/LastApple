using System;
using System.Threading.Tasks;
using LastApple.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/apple/auth")]
    public class AppleAuthController : Controller
    {
        private readonly IDeveloperTokenProvider _tokenProvider;
        private readonly ISessionProvider        _sessionProvider;
        private readonly ISessionRepository      _sessionRepository;

        public AppleAuthController(IDeveloperTokenProvider tokenProvider,
            ISessionProvider sessionProvider,
            ISessionRepository sessionRepository)
        {
            _tokenProvider     = tokenProvider ?? throw new ArgumentNullException(nameof(tokenProvider));
            _sessionProvider   = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
            _sessionRepository = sessionRepository ?? throw new ArgumentNullException(nameof(sessionRepository));
        }

        [HttpGet]
        [Route("developertoken")]
        public IActionResult GetDeveloperToken()
        {
            return Json(_tokenProvider.GetToken());
        }

        [HttpGet]
        [Route("sessiondata")]
        public async Task<IActionResult> GetSessionData()
        {
            return Json(await _sessionProvider.GetSession());
        }

        [HttpPost]
        [Route("sessiondata")]
        public async Task<IActionResult> PostSessionData([FromBody] AppleMusicSessionData sessionData)
        {
            var session = await _sessionProvider.GetSession() ?? new Session { Id = Guid.NewGuid() };

            session.MusicUserToken    = sessionData.MusicUserToken;
            session.MusicStorefrontId = sessionData.MusicStorefrontId;

            await _sessionRepository.SaveSession(session);

            return Json(session);
        }
        
        [HttpDelete]
        [Route("sessiondata")]
        public async Task<IActionResult> DeleteSessionData()
        {
            var session = await _sessionProvider.GetSession();

            session.MusicUserToken    = null;
            session.MusicStorefrontId = null;

            await _sessionRepository.SaveSession(session);

            return NoContent();
        }
    }
}