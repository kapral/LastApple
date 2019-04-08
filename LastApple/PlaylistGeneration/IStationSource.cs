using System.Collections.Generic;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public interface IStationSource<in TDefinition> where TDefinition : IStationDefinition
    {
        Task<IEnumerable<Artist>> GetStationArtists(TDefinition definition);
    }
}