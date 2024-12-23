using System;

namespace LastApple;

public record struct Session(Guid Id,
                             DateTimeOffset StartedAt,
                             DateTimeOffset LastActivityAt,
                             string? LastfmSessionKey,
                             string? LastfmUsername,
                             string? MusicUserToken,
                             string? MusicStorefrontId);