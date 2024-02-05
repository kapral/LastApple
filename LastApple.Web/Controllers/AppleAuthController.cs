using System;
using System.Threading.Tasks;
using LastApple.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/apple/auth")]
public class AppleAuthController(IDeveloperTokenProvider tokenProvider,
                                 ISessionProvider sessionProvider,
                                 ISessionRepository sessionRepository) : Controller
{
    private readonly IDeveloperTokenProvider tokenProvider = tokenProvider ?? throw new ArgumentNullException(nameof(tokenProvider));
    private readonly ISessionProvider        sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
    private readonly ISessionRepository      sessionRepository = sessionRepository ?? throw new ArgumentNullException(nameof(sessionRepository));

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
        var session = await sessionProvider.GetSession();

        session = session == null
                      ? new Session(Id: Guid.NewGuid(),
                                    LastfmSessionKey: null,
                                    LastfmUsername: null,
                                    MusicUserToken: sessionData.MusicUserToken,
                                    MusicStorefrontId: sessionData.MusicStorefrontId)
                      : session with
                      {
                          MusicUserToken = sessionData.MusicUserToken,
                          MusicStorefrontId = sessionData.MusicStorefrontId
                      };

        await sessionRepository.SaveSession(session);

        return Json(session);
    }

    [HttpDelete]
    [Route("sessiondata")]
    public async Task<IActionResult> DeleteSessionData()
    {
        var session = await sessionProvider.GetSession();

        if (session == null)
            return BadRequest();

        session = session with
        {
            MusicUserToken = null,
            MusicStorefrontId = null
        };

        await sessionRepository.SaveSession(session);

        return NoContent();
    }
}