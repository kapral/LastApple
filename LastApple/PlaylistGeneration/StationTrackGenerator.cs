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
        private readonly ILastfmApi               lastfmApi;
        private readonly IRandomizer              randomizer;
        private readonly IStationSource<TStation> source;
        private readonly IStationDataCache        cache;

        public StationTrackGenerator(IRandomizer randomizer,
            ILastfmApi lastfmApi,
            IStationDataCache cache,
            IStationSource<TStation> source)
        {
            this.randomizer = randomizer ?? throw new ArgumentNullException(nameof(randomizer));
            this.lastfmApi  = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            this.cache      = cache ?? throw new ArgumentNullException(nameof(this.cache));
            this.source     = source ?? throw new ArgumentNullException(nameof(source));
        }

        public async Task<TrackInfo> GetNext(TStation station)
        {
            var artists      = (await cache.GetArtists(station, () => source.GetStationArtists(station))).ToArray();
            var randomArtist = artists.ElementAtOrDefault(randomizer.NextDecreasing(artists.Length));

            if (randomArtist == null)
                return null;

            var tracks = await cache.GetArtistTracks(randomArtist, () => lastfmApi.GetTopTracks(randomArtist.Name));

            return await GetRandomTrack(randomArtist.Name, tracks.ToArray());
        }

        private async Task<TrackInfo> GetRandomTrack(string artist, IReadOnlyCollection<Track> tracks)
        {
            var track = tracks.ElementAtOrDefault(randomizer.NextStandard(tracks.Count));

            if (track == null)
                return null;

            var info = await lastfmApi.GetTrackInfo(artist, track.Name);

            return info ?? new TrackInfo(track.Name, null, track.Artist);
        }
    }
}