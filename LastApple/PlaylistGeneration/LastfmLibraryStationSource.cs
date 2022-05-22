using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Enums;
using IF.Lastfm.Core.Api.Helpers;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class LastfmLibraryStationSource : IStationSource<LastfmLibraryStationDefinition>
{
    private readonly IUserApi userApi;

    public LastfmLibraryStationSource(IUserApi userApi)
    {
        this.userApi = userApi ?? throw new ArgumentNullException(nameof(userApi));
    }

    public async Task<IReadOnlyCollection<Artist>> GetStationArtists(LastfmLibraryStationDefinition definition)
    {
        if (definition == null) throw new ArgumentNullException(nameof(definition));

        var response = await userApi.GetTopArtists(definition.User, pagenumber: 1, count: 100, span: GetSpan(definition.Period));

        return response.Success
                   ? response.Content.Select(x => new Artist(Name: x.Name)).ToArray()
                   : Array.Empty<Artist>();
    }

    private static LastStatsTimeSpan GetSpan(string period)
        => Enum.GetValues(typeof(LastStatsTimeSpan))
               .Cast<LastStatsTimeSpan>()
               .FirstOrDefault(x => x.GetApiName() == period);
}