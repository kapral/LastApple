using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LastApple.Persistence.Model;

public record struct Session([property: BsonId][property:BsonGuidRepresentation(GuidRepresentation.Standard)] Guid Id,
                             DateTimeOffset StartedAt,
                             DateTimeOffset LastActivityAt,
                             string? LastfmSessionKey,
                             string? LastfmUsername,
                             string? MusicUserToken,
                             string? MusicStorefrontId);