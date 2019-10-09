using System;
using System.Collections.Generic;

namespace LastApple
{
    public class SessionRepository : ISessionRepository
    {
        private readonly IDictionary<Guid, Session> _keyStorage = new Dictionary<Guid, Session>();

        public Session GetSession(Guid sessionId)
        {
            if (_keyStorage.TryGetValue(sessionId, out var session))
                return session;

            return null;
        }

        public void SaveSession(Session session)
        {
            _keyStorage[session.Id] = session;
        }
    }
}