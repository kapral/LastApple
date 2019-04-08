using System.Threading.Tasks;

namespace AppleMusicApi
{
    public interface ICatalogApi
    {
        Task<SearchResult> Search(SearchParams searchParams);
    }
}