using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class TagsStationSource : IStationSource<TagsStationDefinition>
    {
        private readonly ILastfmApi _lastfmApi;
        private const int LastFmPageSize        = 200;
        private const int MaxPageNumber         = 10;
        private const int MinIntersectionLength = 5;

        public TagsStationSource(ILastfmApi lastfmApi)
        {
            _lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        public async Task<IEnumerable<Artist>> GetStationArtists(TagsStationDefinition definition)
        {
            var artistsByTag = definition.Tags.ToDictionary(x => x, x => new List<Artist>());

            var intersection = new Artist[0];

            for (var page = 1; page <= MaxPageNumber; page++)
            {
                intersection = null;

                foreach (var (tag, artists) in artistsByTag)
                {
                    var pageArtists = (await _lastfmApi.GetTagArtists(tag, page, LastFmPageSize)).ToArray();

                    if (page == 1 && !pageArtists.Any())
                        return new Artist[0];

                    artists.AddRange(pageArtists);
                    intersection = intersection?.Intersect(artists).ToArray() ?? artists.ToArray();
                }

                if (intersection != null && intersection.Length >= MinIntersectionLength)
                    return intersection;
            }

            return intersection;
        }
    }
}