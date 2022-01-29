using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Model;

namespace LastApple.PlaylistGeneration
{
    public class TagsStationSource : IStationSource<TagsStationDefinition>
    {
        private readonly ITagApi tagApi;
        private const int LastFmPageSize        = 200;
        private const int MaxPageNumber         = 10;
        private const int MinIntersectionLength = 5;

        public TagsStationSource(ITagApi tagApi)
        {
            this.tagApi = tagApi ?? throw new ArgumentNullException(nameof(tagApi));
        }

        public async Task<IReadOnlyCollection<Artist>> GetStationArtists(TagsStationDefinition definition)
        {
            var artistsByTag = definition.Tags.ToDictionary(x => x, x => new List<Artist>());

            var intersection = Array.Empty<Artist>();

            for (var page = 1; page <= MaxPageNumber; page++)
            {
                intersection = null;

                foreach (var (tag, artists) in artistsByTag)
                {
                    var pageArtists = (await tagApi.GetTopArtistsAsync(tag, page, LastFmPageSize)).ToArray();

                    if (page == 1 && !pageArtists.Any())
                        return Array.Empty<Artist>();

                    artists.AddRange(pageArtists.Select(x => new Artist { Name = x.Name }));
                    intersection = intersection?.Intersect(artists).ToArray() ?? artists.ToArray();
                }

                if (intersection != null && intersection.Length >= MinIntersectionLength)
                    return intersection;
            }

            return intersection;
        }
    }
}