using System.Collections.Generic;
using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public interface IStationSource<in TDefinition> where TDefinition : IStationDefinition
{
    Task<IReadOnlyCollection<Artist>> GetStationArtists(TDefinition definition);
}