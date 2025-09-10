using System;
using System.Threading.Tasks;
using LastApple.Web.Exceptions;
using LastApple.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/apple/auth")]
public class AppleAuthController(IDeveloperTokenProvider tokenProvider,
                                 ISessionProvider sessionProvider,
                                 ISessionRepository sessionRepository) : Controller
{
    [HttpGet]
    [Route("developertoken")]
    public string GetDeveloperToken()
    {
        return tokenProvider.GetToken();
    }

    [HttpGet]
    [Route("sessiondata")]
    public async Task<Session> GetSessionData()
    {
        return await sessionProvider.GetSession();
    }

    [HttpPost]
    [Route("sessiondata")]
    public async Task<Session> PostSessionData([FromBody] AppleMusicSessionData sessionData)
    {
        var session = await sessionProvider.GetSession();

        session = session.Id == Guid.Empty
                      ? new Session(Id: Guid.NewGuid(),
                                    StartedAt: DateTimeOffset.UtcNow,
                                    LastActivityAt: DateTimeOffset.UtcNow,
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

        return session;
    }

    [HttpDelete]
    [Route("sessiondata")]
    public async Task DeleteSessionData()
    {
        var session = await sessionProvider.GetSession();

        if (session.Id == Guid.Empty)
            throw new BadRequestException();

        session = session with
        {
            MusicUserToken = null,
            MusicStorefrontId = null
        };

        await sessionRepository.SaveSession(session);
    }
}