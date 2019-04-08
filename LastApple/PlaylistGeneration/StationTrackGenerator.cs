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
        private          StationCache             _cache;
        private          TStation                 _station;

        public StationTrackGenerator(IRandomizer randomizer, ILastfmApi lastfmApi, IStationSource<TStation> source)
        {
            _randomizer = randomizer ?? throw new ArgumentNullException(nameof(randomizer));
            _lastfmApi  = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            _source     = source ?? throw new ArgumentNullException(nameof(source));
        }

        public async Task<TrackInfo> GetNext()
        {
            var artists      = (await _cache.GetArtists()).ToArray();
            var randomArtist = artists.ElementAtOrDefault(_randomizer.NextDecreasing(artists.Length));

            if (randomArtist == null)
                return null;

            var tracks = await _cache.GetOrAddTracks(randomArtist, () => _lastfmApi.GetTopTracks(randomArtist.Name));

            return await GetRandomTrack(randomArtist.Name, tracks.ToArray());
        }

        public TStation Station
        {
            get => _station;
            set
            {
                _station = value;
                _cache = new StationCache(_source, value);
            }
        }

        private async Task<TrackInfo> GetRandomTrack(string artist, IReadOnlyCollection<Track> tracks)
        {
            var track = tracks.ElementAtOrDefault(_randomizer.NextStandard(tracks.Count));

            if (track == null)
                return null;

            var info = await _lastfmApi.GetTrackInfo(artist, track.Name);

            return info ?? new TrackInfo(track.Name, null, track.Artist);
        }

        private class StationCache
        {
            private readonly IStationSource<TStation>     _source;
            private readonly TStation                     _stationDefinition;
            private readonly IDictionary<string, Track[]> _tracksCache;
            private          IEnumerable<Artist>          _artists;

            public StationCache(IStationSource<TStation> source, TStation stationDefinition)
            {
                _source      = source;
                _stationDefinition = stationDefinition;
                _tracksCache = new Dictionary<string, Track[]>();
            }

            public async Task<IEnumerable<Track>> GetOrAddTracks(Artist artist,
                Func<Task<IEnumerable<Track>>> getTracks)
            {
                if (_tracksCache.TryGetValue(artist.Name, out var topTracks))
                    return topTracks;

                var tracks = await getTracks() ?? new Track[0];

                topTracks                 = tracks.ToArray();
                _tracksCache[artist.Name] = topTracks;

                return topTracks;
            }

            public async Task<IEnumerable<Artist>> GetArtists()
            {
                if (_artists != null)
                    return _artists;

                _artists = await _source.GetStationArtists(_stationDefinition);

                return _artists;
            }
        }
    }
}