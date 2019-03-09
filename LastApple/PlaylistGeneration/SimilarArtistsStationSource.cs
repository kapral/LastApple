using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class SimilarArtistsStationSource : IStationSource<SimilarArtistsStationDefinition>
    {
        private readonly ILastfmApi _lastfmApi;

        public SimilarArtistsStationSource(ILastfmApi lastfmApi)
        {
            _lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        public SimilarArtistsStationDefinition StationDefinition { get; set; }


        public async Task<IEnumerable<Artist>> GetStationArtists()
        {
            var similarArtists = await _lastfmApi.GetSimilarArtists(StationDefinition.SourceArtist);
            return new[] { new Artist(StationDefinition.SourceArtist) }.Concat(similarArtists ?? new Artist[0])
                .ToArray();
        }
    }
}