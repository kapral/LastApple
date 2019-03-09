using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration {
    public interface IStationTrackGenerator {
        Task<TrackInfo> GetNext();

        IStationSource Source { get; set; }
    }
}