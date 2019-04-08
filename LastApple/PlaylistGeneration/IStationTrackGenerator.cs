using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration {
    public interface IStationTrackGenerator<TStation> where TStation : IStationDefinition {
        Task<TrackInfo> GetNext();

        TStation Station { get; set; }
    }
}