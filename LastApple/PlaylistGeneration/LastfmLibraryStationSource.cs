using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Enums;
using IF.Lastfm.Core.Api.Helpers;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class LastfmLibraryStationSource(IUserApi userApi) : IStationSource<LastfmLibraryStationDefinition>
{
    public async Task<IReadOnlyCollection<Artist>> GetStationArtists(LastfmLibraryStationDefinition definition)
    {
        ArgumentNullException.ThrowIfNull(definition);

        var response = await userApi.GetTopArtists(definition.User, pagenumber: 1, count: 100, span: GetSpan(definition.Period));

        return response.Select(x => new Artist(Name: x.Name)).ToArray();
    }

    private static LastStatsTimeSpan GetSpan(string period)
        => Enum.GetValues(typeof(LastStatsTimeSpan))
               .Cast<LastStatsTimeSpan>()
               .FirstOrDefault(x => x.GetApiName() == period);
}