using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class StationTrackGenerator<TStation> : IStationTrackGenerator<TStation> where TStation : IStationDefinition
    {
        private readonly ILastfmApi               _lastfmApi;
        private readonly IRandomizer              _randomizer;
        private readonly IStationSource<TStation> _source;
        private readonly ILastfmCache             _cache;

        public StationTrackGenerator(IRandomizer randomizer,
            ILastfmApi lastfmApi,
            ILastfmCache cache,
            IStationSource<TStation> source)
        {
            _randomizer = randomizer ?? throw new ArgumentNullException(nameof(randomizer));
            _lastfmApi  = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            _cache      = cache ?? throw new ArgumentNullException(nameof(_cache));
            _source     = source ?? throw new ArgumentNullException(nameof(source));
        }

        public async Task<TrackInfo> GetNext(TStation station)
        {
            var artists      = (await _cache.GetArtists(station, () => _source.GetStationArtists(station))).ToArray();
            var randomArtist = artists.ElementAtOrDefault(_randomizer.NextDecreasing(artists.Length));

            if (randomArtist == null)
                return null;

            var tracks = await _cache.GetArtistTracks(randomArtist, () => _lastfmApi.GetTopTracks(randomArtist.Name));

            return await GetRandomTrack(randomArtist.Name, tracks.ToArray());
        }

        private async Task<TrackInfo> GetRandomTrack(string artist, IReadOnlyCollection<Track> tracks)
        {
            var track = tracks.ElementAtOrDefault(_randomizer.NextStandard(tracks.Count));

            if (track == null)
                return null;

            var info = await _lastfmApi.GetTrackInfo(artist, track.Name);

            return info ?? new TrackInfo(track.Name, null, track.Artist);
        }
    }
}