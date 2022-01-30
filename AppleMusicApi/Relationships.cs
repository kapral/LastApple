namespace AppleMusicApi;

public class Relationships
{
    public ResourceMatches<SongAttributes> Tracks { get; set; }

    public ResourceMatches<AlbumAttributes> Albums { get; set; }
}