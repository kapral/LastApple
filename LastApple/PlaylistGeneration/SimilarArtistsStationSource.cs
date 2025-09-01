using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class SimilarArtistsStationSource(IArtistApi artistApi) : IStationSource<SimilarArtistsStationDefinition>
{
    public async Task<IReadOnlyCollection<Artist>> GetStationArtists(SimilarArtistsStationDefinition definition)
    {
        ArgumentNullException.ThrowIfNull(definition);

        var similarArtists = await artistApi.GetSimilarAsync(definition.SourceArtist);

        return similarArtists.Content.Any()
                   ? new[] { new Artist(Name: definition.SourceArtist) }.Concat(similarArtists.Select(x => new Artist(Name: x.Name))).ToArray()
                   : [];
    }
}