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
        private const int MaxLastFmPageSize     = 1000;
        private const int MaxPageNumber         = 100;
        private const int MinIntersectionLength = 5;

        public TagsStationSource(ILastfmApi lastfmApi)
        {
            _lastfmApi     = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        public TagsStationDefinition StationDefinition { get; set; }

        public async Task<IEnumerable<Artist>> GetStationArtists()
        {
            var artistsByTag = StationDefinition.Tags.ToDictionary(x => x, x => new List<Artist>());

            var intersection = new Artist[0];

            for (var page = 1; page <= MaxPageNumber; page++)
            {
                intersection = null;

                foreach (var (tag, artists) in artistsByTag)
                {
                    var pageArtists = (await _lastfmApi.GetTagArtists(tag, page, MaxLastFmPageSize)).ToArray();

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