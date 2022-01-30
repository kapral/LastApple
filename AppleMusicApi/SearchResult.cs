namespace AppleMusicApi;

public class SearchResult
{
    public ResourceMatches<ArtistAttributes> Artists { get; init; }

    public ResourceMatches<AlbumAttributes> Albums { get; init; }

    public ResourceMatches<SongAttributes> Songs { get; init; }
}