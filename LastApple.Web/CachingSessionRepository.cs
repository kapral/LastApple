using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;

namespace LastApple.Web;

public class CachingSessionRepository(ISessionRepository concreteRepository, IMemoryCache memoryCache) : ISessionRepository
{
    public Task<Session> GetSession(Guid sessionId)
        => memoryCache.GetOrCreateAsync(Key(sessionId), async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return await concreteRepository.GetSession(sessionId);
        });

    public async Task SaveSession(Session session)
    {
        ArgumentNullException.ThrowIfNull(session);

        await concreteRepository.SaveSession(session);

        memoryCache.Remove(Key(session.Id));
    }

    private static string Key(Guid sessionId) => $"session:{sessionId}";
}