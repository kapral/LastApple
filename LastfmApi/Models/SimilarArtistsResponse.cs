namespace LastfmApi.Models
{
    public class SimilarArtistsResponse
    {
        public SimilarArtistsResponse(TopArtists similarartists, int error)
        {
            SimilarArtists = similarartists;
            Error          = error;
        }

        public TopArtists SimilarArtists { get; }

        public int Error { get; }
    }
}