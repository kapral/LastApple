using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LastfmApi;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class LastfmLibraryStationSource : IStationSource<LastfmLibraryStationDefinition>
    {
        private readonly ILastfmApi _lastfmApi;

        public LastfmLibraryStationSource(ILastfmApi lastfmApi)
        {
            _lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        public Task<IEnumerable<Artist>> GetStationArtists(LastfmLibraryStationDefinition definition)
        {
            if (definition == null) throw new ArgumentNullException(nameof(definition));

            return _lastfmApi.GetUserArtists(definition.User, limit: 100, period: definition.Period);
        }
    }
}