using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;

namespace LastfmPlayer.Core.PlaylistGeneration {
    public interface IStationGenerator<TStation> where TStation : IStationDefinition {
        Task Generate(Station<TStation> station);
        Task TopUp(Station<TStation> station, int count);
    }
}