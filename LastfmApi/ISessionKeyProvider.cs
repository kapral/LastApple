using System.Threading.Tasks;

namespace LastfmApi
{
    public interface ISessionKeyProvider
    {
        Task<string> GetSessionKey();
    }
}