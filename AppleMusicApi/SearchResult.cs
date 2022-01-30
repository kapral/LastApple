namespace AppleMusicApi;

public class SearchResult
{
    public ResourceMatches<ArtistAttributes> Artists { get; set; }

    public ResourceMatches<AlbumAttributes> Albums { get; set; }

    public ResourceMatches<SongAttributes> Songs { get; set; }
}