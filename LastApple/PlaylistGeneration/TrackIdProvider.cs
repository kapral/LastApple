using System;
using System.Linq;
using System.Threading.Tasks;
using AppleMusicApi;

namespace LastApple.PlaylistGeneration;

public class TrackIdProvider(ICatalogApi catalogApi) : ITrackIdProvider
{
    public async Task<string?> FindTrackId(string artist, string track, string storefront)
    {
        var searchParams = new SearchParams(Term: $"{artist} - {track}",
                                            Types: ResourceType.Songs,
                                            Limit: 1);

        var result     = await catalogApi.Search(searchParams, storefront);

        return result.Songs?.Data.Select(x => x.Id).FirstOrDefault();
    }
}