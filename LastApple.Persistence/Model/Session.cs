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

    public string? LastfmSessionKey { get; init; }

    public string? LastfmUsername { get; init; }

    public string? MusicUserToken { get; init; }

    public string? MusicStorefrontId { get; init; }
}