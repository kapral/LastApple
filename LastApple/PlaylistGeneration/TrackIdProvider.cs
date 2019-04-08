using System;
using System.Linq;
using System.Threading.Tasks;
using AppleMusicApi;

namespace LastApple.PlaylistGeneration
{
    public class TrackIdProvider : ITrackIdProvider
    {
        private readonly ICatalogApi _catalogApi;

        public TrackIdProvider(ICatalogApi catalogApi)
        {
            _catalogApi = catalogApi ?? throw new ArgumentNullException(nameof(catalogApi));
        }

        public async Task<string> FindTrackId(string artist, string track)
        {
            var searchParams = new SearchParams
            {
                Term  = $"{artist} - {track}",
                Types = ResourceType.Songs,
                Limit = 1
            };

            var result = await _catalogApi.Search(searchParams);

            return result.Songs?.Data?.Select(x => x.Id).FirstOrDefault();
        }
    }
}