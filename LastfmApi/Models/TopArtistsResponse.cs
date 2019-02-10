namespace LastfmApi.Models
{
    public class TopArtistsResponse
    {
        public TopArtistsResponse(TopArtists topArtists, int error)
        {
            TopArtists = topArtists;
            Error      = error;
        }

        public TopArtists TopArtists { get; }

        public int Error { get; }
    }
}