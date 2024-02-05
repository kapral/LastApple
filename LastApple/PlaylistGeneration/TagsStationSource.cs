using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class TagsStationSource(ITagApi tagApi) : IStationSource<TagsStationDefinition>
{
    private readonly ITagApi tagApi = tagApi ?? throw new ArgumentNullException(nameof(tagApi));
    private const int LastFmPageSize        = 200;
    private const int MaxPageNumber         = 10;
    private const int MinIntersectionLength = 5;

    public async Task<IReadOnlyCollection<Artist>> GetStationArtists(TagsStationDefinition definition)
    {
        var artistsByTag = definition.Tags.ToDictionary(x => x, _ => new List<Artist>());

        Artist[]? intersection = null;

        for (var page = 1; page <= MaxPageNumber; page++)
        {
            intersection = null;

            foreach (var (tag, artists) in artistsByTag)
            {
                var pageArtists = (await tagApi.GetTopArtistsAsync(tag, page, LastFmPageSize)).ToArray();

                if (page == 1 && !pageArtists.Any())
                    return Array.Empty<Artist>();

                artists.AddRange(pageArtists.Select(x => new Artist(Name: x.Name)));
                intersection = intersection?.Intersect(artists).ToArray() ?? artists.ToArray();
            }

            if (intersection is { Length: >= MinIntersectionLength })
                return intersection;
        }

        return intersection ?? Array.Empty<Artist>();
    }
}