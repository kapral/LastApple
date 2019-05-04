using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration {
    public interface IStationTrackGenerator<in TStation> where TStation : IStationDefinition {
        Task<TrackInfo> GetNext(TStation station);
    }
}