using System.Collections.Generic;

namespace LastfmApi.Models
{
    public class TopTracks
    {
        public TopTracks(IEnumerable<Track> track)
        {
            Tracks = track ?? new Track[0];
        }

        public IEnumerable<Track> Tracks { get; }
    }
}