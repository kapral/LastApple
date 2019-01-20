namespace LastfmApi.Api
{
    public class TopTracksResponse
    {
        public TopTracksResponse(TopTracks topTracks, int error)
        {
            TopTracks = topTracks;
            Error     = error;
        }

        public TopTracks TopTracks { get; }

        public int Error { get; }
    }
}