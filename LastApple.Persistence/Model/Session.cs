using System;
using MongoDB.Bson.Serialization.Attributes;

namespace LastApple.Persistence.Model;

public record Session
{
    [BsonId]
    public Guid Id { get; init; }

    public string LastfmSessionKey { get; init; }

    public string LastfmUsername { get; init; }

    public string MusicUserToken { get; init; }

    public string MusicStorefrontId { get; init; }
}