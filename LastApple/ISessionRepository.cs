using System;
using System.Threading.Tasks;

namespace LastApple;

public interface ISessionRepository
{
    Task<Session> GetSession(Guid sessionId);

    Task SaveSession(Session session);
}