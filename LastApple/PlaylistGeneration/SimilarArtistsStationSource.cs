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
        private readonly ILastfmApi lastfmApi;

        public SimilarArtistsStationSource(ILastfmApi lastfmApi)
        {
            this.lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        public async Task<IEnumerable<Artist>> GetStationArtists(SimilarArtistsStationDefinition definition)
        {
            if (definition == null) throw new ArgumentNullException(nameof(definition));

            var similarArtists = await lastfmApi.GetSimilarArtists(definition.SourceArtist);
            return new[] { new Artist(definition.SourceArtist) }.Concat(similarArtists ?? new Artist[0])
                .ToArray();
        }
    }
}