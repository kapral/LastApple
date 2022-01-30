using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace LastApple.Web;

public class CachingSessionRepository : ISessionRepository
{
    private readonly ISessionRepository concreteRepository;
    private readonly ConcurrentDictionary<Guid, Task<Session>> sessionCache;

    public CachingSessionRepository(ISessionRepository concreteRepository)
    {
        this.concreteRepository = concreteRepository ?? throw new ArgumentNullException(nameof(concreteRepository));
        sessionCache            = new ConcurrentDictionary<Guid, Task<Session>>();
    }

    public Task<Session> GetSession(Guid sessionId)
    {
        if (sessionCache.TryGetValue(sessionId, out var sessionTask) && !sessionTask.IsCanceled && !sessionTask.IsFaulted)
            return sessionTask;

        sessionTask = concreteRepository.GetSession(sessionId);
        return sessionCache.AddOrUpdate(sessionId, sessionTask, (id, add) => sessionTask);
    }

    public async Task SaveSession(Session session)
    {
        if (session == null) throw new ArgumentNullException(nameof(session));

        await concreteRepository.SaveSession(session);

        sessionCache.TryRemove(session.Id, out _);
    }
}