using System;
using MongoDB.Bson.Serialization.Attributes;

namespace LastApple.Persistence.Model;

public record Session
{
    public Session(Guid id,
                   string? lastfmSessionKey,
                   string? lastfmUsername,
                   string? musicUserToken,
                   string? musicStorefrontId)
        => (Id, LastfmSessionKey, LastfmUsername, MusicUserToken, MusicStorefrontId)
           = (id, lastfmSessionKey, lastfmUsername, musicUserToken, musicStorefrontId);

    [BsonId]
    public Guid Id { get; init; }

    public string? LastfmSessionKey { get; }

    public string? LastfmUsername { get; }

    public string? MusicUserToken { get; }

    public string? MusicStorefrontId { get; }
}