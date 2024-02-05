using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace LastApple.Persistence;

public class SessionRepository(IMongoClient mongoClient) : ISessionRepository
{
    private readonly IMongoClient mongoClient = mongoClient ?? throw new ArgumentNullException(nameof(mongoClient));

    public async Task<Session?> GetSession(Guid id)
    {
        var db = mongoClient.GetDatabase("lastapple");

        var domainSession = await db.GetCollection<Model.Session>("sessions")
                                    .AsQueryable()
                                    .Where(x => x.Id == id)
                                    .FirstOrDefaultAsync();

        return domainSession != null
                   ? new Session(Id: domainSession.Id,
                                 LastfmSessionKey: domainSession.LastfmSessionKey,
                                 LastfmUsername: domainSession.LastfmUsername,
                                 MusicUserToken: domainSession.MusicUserToken,
                                 MusicStorefrontId: domainSession.MusicStorefrontId)
                   : null;
    }

    public async Task SaveSession(Session session)
    {
        if (session == null) throw new ArgumentNullException(nameof(session));

        var db = mongoClient.GetDatabase("lastapple");

        var domainSession = new Model.Session(Id: session.Id,
                                              LastfmSessionKey: session.LastfmSessionKey,
                                              LastfmUsername: session.LastfmUsername,
                                              MusicUserToken: session.MusicUserToken,
                                              MusicStorefrontId: session.MusicStorefrontId);

        var filter = new BsonDocument("_id", new BsonBinaryData(domainSession.Id, GuidRepresentation.Standard));

        await db.GetCollection<Model.Session>("sessions")
                .ReplaceOneAsync(filter, domainSession, new ReplaceOptions { IsUpsert = true });
    }
}