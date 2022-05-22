namespace AppleMusicApi;

public record Relationships(ResourceMatches<SongAttributes> Tracks,
                            ResourceMatches<AlbumAttributes> Albums);