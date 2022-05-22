namespace AppleMusicApi;

public record SearchResult(ResourceMatches<ArtistAttributes> Artists,
                           ResourceMatches<AlbumAttributes> Albums,
                           ResourceMatches<SongAttributes>? Songs);