using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppleMusicApi
{
    public interface ICatalogApi
    {
        Task<SearchResult> Search(SearchParams searchParams);
        Task<IEnumerable<Resource<AlbumAttributes>>> GetAlbums(IEnumerable<string> ids);
        Task<Resource<ArtistAttributes>> GetArtist(string id);
    }
}