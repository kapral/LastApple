using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppleMusicApi;

public interface ICatalogApi
{
    Task<SearchResult> Search(SearchParams searchParams, string storefront);

    Task<IReadOnlyCollection<Resource<AlbumAttributes>>> GetAlbums(IReadOnlyCollection<string> ids, string storefront);

    Task<Resource<ArtistAttributes>?> GetArtist(string id, string storefront);
}