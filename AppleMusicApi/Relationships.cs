namespace AppleMusicApi;

public record Relationships
{
    public ResourceMatches<SongAttributes> Tracks { get; init; }

    public ResourceMatches<AlbumAttributes> Albums { get; init; }
}