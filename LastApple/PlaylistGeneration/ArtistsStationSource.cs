using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class ArtistsStationSource : IStationSource<ArtistsStationDefinition>
    {
        public ArtistsStationDefinition StationDefinition { get; set; }

        public Task<IEnumerable<Artist>> GetStationArtists()
        {
            return Task.FromResult(StationDefinition.Artists.Select(x => new Artist(x)));
        }
    }
}