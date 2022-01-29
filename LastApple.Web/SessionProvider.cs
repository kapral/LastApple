using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace LastApple.Web
{
    public class SessionProvider : ISessionProvider
    {
        private readonly ISessionRepository sessionRepository;

        public SessionProvider(ISessionRepository sessionRepository, IHttpContextAccessor httpContextAccessor)
        {
            this.sessionRepository = sessionRepository ?? throw new ArgumentNullException(nameof(sessionRepository));

            if (httpContextAccessor == null) throw new ArgumentNullException(nameof(httpContextAccessor));

            SessionId = httpContextAccessor.HttpContext.Request.Headers["X-SessionId"];
        }

        private string SessionId { get; }

        public async Task<Session> GetSession()
        {
            if (!Guid.TryParse(SessionId, out var id))
                return null;

            return await sessionRepository.GetSession(id);
        }
    }
}