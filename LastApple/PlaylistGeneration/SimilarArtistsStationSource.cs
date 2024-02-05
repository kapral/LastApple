using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class SimilarArtistsStationSource(IArtistApi artistApi) : IStationSource<SimilarArtistsStationDefinition>
{
    private readonly IArtistApi artistApi = artistApi ?? throw new ArgumentNullException(nameof(artistApi));

    public async Task<IReadOnlyCollection<Artist>> GetStationArtists(SimilarArtistsStationDefinition definition)
    {
        if (definition == null) throw new ArgumentNullException(nameof(definition));

        var similarArtists = await artistApi.GetSimilarAsync(definition.SourceArtist);

        return similarArtists.Success
                   ? new[] { new Artist(Name: definition.SourceArtist) }.Concat(similarArtists.Select(x => new Artist(Name: x.Name))).ToArray()
                   : Array.Empty<Artist>();
    }
}