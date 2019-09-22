using System;
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
        public IActionResult GetSessionData()
        {
            return Json(_sessionProvider.Session);
        }

        [HttpPost]
        [Route("sessiondata")]
        public IActionResult PostSessionData([FromBody] AppleMusicSessionData sessionData)
        {
            var session = _sessionProvider.Session ?? new Session { Id = Guid.NewGuid() };

            session.MusicUserToken    = sessionData.MusicUserToken;
            session.MusicStorefrontId = sessionData.MusicStorefrontId;

            _sessionRepository.SaveSession(session);

            return Json(session);
        }
    }
}