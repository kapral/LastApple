using System.Collections.Generic;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public interface IStationSource
    {
        Task<IEnumerable<Artist>> GetStationArtists();
    }

    public interface IStationSource<out TDefinition> : IStationSource where TDefinition : IStationDefinition
    {
        TDefinition StationDefinition { get; }
    }
}