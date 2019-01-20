using System;
using System.Collections.Generic;

namespace LastfmApi.Api
{
    public class TopArtists
    {
        public TopArtists(IEnumerable<Artist> artist)
        {
            Artists = artist ?? throw new ArgumentNullException(nameof(artist));
        }

        public IEnumerable<Artist> Artists { get; }
    }
}