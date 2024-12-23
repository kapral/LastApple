using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace LastApple.Web;

public class SessionProvider(ISessionRepository sessionRepository, IHttpContextAccessor httpContextAccessor) : ISessionProvider
{
    private HttpContext HttpContext => httpContextAccessor.HttpContext ?? throw new InvalidOperationException("HttpContext is not available");

    private readonly TimeSpan activityThreshold = TimeSpan.FromMinutes(30);

    private string SessionId => HttpContext.Request.Headers["X-SessionId"].ToString();

    public async Task<Session> GetSession()
    {
        if (!Guid.TryParse(SessionId, out var id))
            return default;

        var session = await sessionRepository.GetSession(id);

        if (session.Id != Guid.Empty && DateTimeOffset.UtcNow - session.LastActivityAt > activityThreshold)
        {
            session.LastActivityAt = DateTimeOffset.UtcNow;
            await sessionRepository.SaveSession(session);
        }

        return session;
    }
}