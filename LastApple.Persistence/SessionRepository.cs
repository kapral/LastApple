using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace LastApple.Persistence;

public class SessionRepository(IMongoClient mongoClient, IOptions<MongoConnectionDetails> options) : ISessionRepository
{
    public async Task<Session> GetSession(Guid id)
    {
        var db = mongoClient.GetDatabase(options.Value.DatabaseName);

        var domainSession = await db.GetCollection<Model.Session>("sessions")
                              .Find(x => x.Id == id)
                              .FirstOrDefaultAsync();

        return new Session(Id: domainSession.Id,
                           StartedAt: domainSession.StartedAt,
                           LastActivityAt: domainSession.StartedAt,
                           LastfmSessionKey: domainSession.LastfmSessionKey,
                           LastfmUsername: domainSession.LastfmUsername,
                           MusicUserToken: domainSession.MusicUserToken,
                           MusicStorefrontId: domainSession.MusicStorefrontId);
    }

    public async Task SaveSession(Session session)
    {
        ArgumentNullException.ThrowIfNull(session);

        var db = mongoClient.GetDatabase(options.Value.DatabaseName);

        var domainSession = new Model.Session(Id: session.Id,
                                              StartedAt: session.StartedAt,
                                              LastActivityAt: DateTimeOffset.UtcNow,
                                              LastfmSessionKey: session.LastfmSessionKey,
                                              LastfmUsername: session.LastfmUsername,
                                              MusicUserToken: session.MusicUserToken,
                                              MusicStorefrontId: session.MusicStorefrontId);

        await db.GetCollection<Model.Session>("sessions")
                .ReplaceOneAsync(x => x.Id == domainSession.Id, domainSession, new ReplaceOptions { IsUpsert = true });
    }
}