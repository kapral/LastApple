using System.Threading.Tasks;

namespace LastApple.PlaylistGeneration
{
    public interface ITrackIdProvider
    {
        Task<string> FindTrackId(string artist, string track);
    }
}