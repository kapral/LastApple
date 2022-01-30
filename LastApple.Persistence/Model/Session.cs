using System;
using MongoDB.Bson.Serialization.Attributes;

namespace LastApple.Persistence.Model;

public class Session
{
    [BsonId]
    public Guid Id { get; set; }

    public string LastfmSessionKey { get; set; }

    public string LastfmUsername { get; set; }

    public string MusicUserToken { get; set; }

    public string MusicStorefrontId { get; set; }
}