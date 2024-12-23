using System;
using System.Linq;
using System.Threading.Tasks;
using AppleMusicApi;

namespace LastApple.PlaylistGeneration;

public class TrackIdProvider(ICatalogApi catalogApi, IStorefrontProvider storefrontProvider) : ITrackIdProvider
{
    public async Task<string?> FindTrackId(string artist, string track)
    {
        var searchParams = new SearchParams(Term: $"{artist} - {track}",
                                            Types: ResourceType.Songs,
                                            Limit: 1);

        var storefront = await storefrontProvider.GetStorefront();
        var result     = await catalogApi.Search(searchParams, storefront);

        return result.Songs?.Data.Select(x => x.Id).FirstOrDefault();
    }
}