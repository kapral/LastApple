using System;
using LastApple.Model;

namespace LastApple.PlaylistGeneration
{
    public class SimilarArtistsStationDefinition : IStationDefinition
    {
        public SimilarArtistsStationDefinition(string sourceArtist)
        {
            if (string.IsNullOrWhiteSpace(sourceArtist))
                throw new ArgumentNullException(nameof(sourceArtist));

            SourceArtist = sourceArtist;
        }

        public string SourceArtist { get; }

        public StationType StationType => StationType.SimilarArtists;
    }
}