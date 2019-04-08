using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class ArtistsStationSource : IStationSource<ArtistsStationDefinition>
    {
        public Task<IEnumerable<Artist>> GetStationArtists(ArtistsStationDefinition definition)
        {
            return Task.FromResult(definition.Artists.Select(x => new Artist(x)));
        }
    }
}