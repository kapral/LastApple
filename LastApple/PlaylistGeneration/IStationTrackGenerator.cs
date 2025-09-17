using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public interface IStationTrackGenerator<in TStation> where TStation : IStationDefinition {
    Task<Track?> GetNext(TStation station);
}