using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppleMusicApi
{
    public interface ICatalogApi
    {
        Task<SearchResult> Search(SearchParams searchParams, string storefront);
        
        Task<IEnumerable<Resource<AlbumAttributes>>> GetAlbums(IEnumerable<string> ids, string storefront);
        
        Task<Resource<ArtistAttributes>> GetArtist(string id, string storefront);
    }
}