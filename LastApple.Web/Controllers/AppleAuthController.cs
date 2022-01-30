using System;
using System.Threading.Tasks;
using LastApple.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/apple/auth")]
public class AppleAuthController : Controller
{
    private readonly IDeveloperTokenProvider tokenProvider;
    private readonly ISessionProvider        sessionProvider;
    private readonly ISessionRepository      sessionRepository;

    public AppleAuthController(IDeveloperTokenProvider tokenProvider,
                               ISessionProvider sessionProvider,
                               ISessionRepository sessionRepository)
    {
        this.tokenProvider     = tokenProvider ?? throw new ArgumentNullException(nameof(tokenProvider));
        this.sessionProvider   = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
        this.sessionRepository = sessionRepository ?? throw new ArgumentNullException(nameof(sessionRepository));
    }

    [HttpGet]
    [Route("developertoken")]
    public IActionResult GetDeveloperToken()
    {
        return Json(tokenProvider.GetToken());
    }

    [HttpGet]
    [Route("sessiondata")]
    public async Task<IActionResult> GetSessionData()
    {
        return Json(await sessionProvider.GetSession());
    }

    [HttpPost]
    [Route("sessiondata")]
    public async Task<IActionResult> PostSessionData([FromBody] AppleMusicSessionData sessionData)
    {
        var session = await sessionProvider.GetSession() ?? new Session { Id = Guid.NewGuid() };

        session.MusicUserToken    = sessionData.MusicUserToken;
        session.MusicStorefrontId = sessionData.MusicStorefrontId;

        await sessionRepository.SaveSession(session);

        return Json(session);
    }
        
    [HttpDelete]
    [Route("sessiondata")]
    public async Task<IActionResult> DeleteSessionData()
    {
        var session = await sessionProvider.GetSession();

        session.MusicUserToken    = null;
        session.MusicStorefrontId = null;

        await sessionRepository.SaveSession(session);

        return NoContent();
    }
}