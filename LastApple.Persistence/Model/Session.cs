using System;
using MongoDB.Bson.Serialization.Attributes;

namespace LastApple.Persistence.Model;

public record Session(
	[property: BsonId] Guid Id,
	string? LastfmSessionKey,
	string? LastfmUsername,
	string? MusicUserToken,
	string? MusicStorefrontId);