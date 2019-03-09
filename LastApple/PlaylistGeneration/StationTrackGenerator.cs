using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class StationTrackGenerator : IStationTrackGenerator
    {
        private readonly ILastfmApi     _lastfmApi;
        private readonly IRandomizer    _randomizer;
        private          IStationSource _source;
        private          StationCache   _cache;

        public StationTrackGenerator(IRandomizer randomizer, ILastfmApi lastfmApi)
        {
            _randomizer = randomizer ?? throw new ArgumentNullException(nameof(randomizer));
            _lastfmApi  = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        public IStationSource Source
        {
            get => _source;
            set
            {
                _source = value;
                _cache  = new StationCache(_source);
            }
        }

        public async Task<TrackInfo> GetNext()
        {
            if (Source == null)
                throw new InvalidOperationException("Station source is not set.");

            var artists      = (await _cache.GetArtists()).ToArray();
            var randomArtist = artists.ElementAtOrDefault(_randomizer.NextDecreasing(artists.Length));

            if (randomArtist == null)
                return null;

            var tracks = await _cache.GetOrAddTracks(randomArtist, () => _lastfmApi.GetTopTracks(randomArtist.Name));

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

        private class StationCache
        {
            private readonly IStationSource               _source;
            private readonly IDictionary<string, Track[]> _tracksCache;
            private          IEnumerable<Artist>          _artists;

            public StationCache(IStationSource source)
            {
                _source = source;
                _tracksCache = new Dictionary<string, Track[]>();
            }

            public async Task<IEnumerable<Track>> GetOrAddTracks(Artist artist, Func<Task<IEnumerable<Track>>> getTracks)
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

                _artists = await _source.GetStationArtists();

                return _artists;
            }
        }
    }
}