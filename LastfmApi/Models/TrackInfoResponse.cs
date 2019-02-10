namespace LastfmApi.Models
{
    public class TrackInfoResponse
    {
        public TrackInfoResponse(TrackInfo track, int error)
        {
            Track = track;
            Error = error;
        }

        public TrackInfo Track { get; }

        public int Error { get; }
    }
}