using System;
using System.Linq;
using System.Threading.Tasks;
using AppleMusicApi;

namespace LastApple.PlaylistGeneration;

public class TrackIdProvider : ITrackIdProvider
{
    private readonly ICatalogApi catalogApi;
    private readonly IStorefrontProvider storefrontProvider;

    public TrackIdProvider(ICatalogApi catalogApi, IStorefrontProvider storefrontProvider)
    {
        this.catalogApi         = catalogApi ?? throw new ArgumentNullException(nameof(catalogApi));
        this.storefrontProvider = storefrontProvider ?? throw new ArgumentNullException(nameof(storefrontProvider));
    }

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