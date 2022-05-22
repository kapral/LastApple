using System;

namespace LastApple;

public record Session(Guid Id,
                      string? LastfmSessionKey,
                      string? LastfmUsername,
                      string? MusicUserToken,
                      string? MusicStorefrontId);