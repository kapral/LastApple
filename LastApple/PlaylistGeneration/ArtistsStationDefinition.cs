using System.Collections.Generic;
using LastApple.Model;

namespace LastApple.PlaylistGeneration
{
    public class ArtistsStationDefinition : IStationDefinition
    {
        public IEnumerable<string> Artists { get; set; }

        public StationType StationType => StationType.Artists;
    }
}