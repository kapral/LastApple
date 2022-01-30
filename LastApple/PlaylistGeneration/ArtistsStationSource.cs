using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class ArtistsStationSource : IStationSource<ArtistsStationDefinition>
{
    public Task<IReadOnlyCollection<Artist>> GetStationArtists(ArtistsStationDefinition definition)
    {
        if (definition == null) throw new ArgumentNullException(nameof(definition));

        return Task.FromResult<IReadOnlyCollection<Artist>>(definition.Artists.Select(x => new Artist{ Name = x }).ToArray());
    }
}