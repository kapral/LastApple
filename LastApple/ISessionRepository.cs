using System;

namespace LastApple
{
    public interface ISessionRepository
    {
        Session GetSession(Guid sessionId);

        void SaveSession(Session session);
    }
}