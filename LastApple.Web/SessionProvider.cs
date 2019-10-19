using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace LastApple.Web
{
    public class SessionProvider : ISessionProvider
    {
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly ISessionRepository sessionRepository;

        public SessionProvider(ISessionRepository sessionRepository, IHttpContextAccessor httpContextAccessor)
        {
            this.sessionRepository   = sessionRepository;
            this.httpContextAccessor = httpContextAccessor;
        }

        public async Task<Session> GetSession()
        {
            var sessionId = httpContextAccessor.HttpContext.Request.Headers["X-SessionId"];

            if (!Guid.TryParse(sessionId, out var id))
                return null;

            return await sessionRepository.GetSession(id);
        }
    }
}