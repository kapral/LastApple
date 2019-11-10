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
        private readonly ILastfmApi lastfmApi;
        private readonly IRandomizer randomizer;
        private readonly ITrackRepository trackRepository;
        private readonly IStationSource<TStation> stationSource;

        public StationTrackGenerator(IRandomizer randomizer,
            ILastfmApi lastfmApi,
            ITrackRepository trackRepository,
            IStationSource<TStation> stationSource)
        {
            this.randomizer      = randomizer ?? throw new ArgumentNullException(nameof(randomizer));
            this.lastfmApi       = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            this.trackRepository = trackRepository ?? throw new ArgumentNullException(nameof(trackRepository));
            this.stationSource   = stationSource ?? throw new ArgumentNullException(nameof(stationSource));
        }

        public async Task<TrackInfo> GetNext(TStation station)
        {
            if (station == null) throw new ArgumentNullException(nameof(station));

            var artists      = (await stationSource.GetStationArtists(station)).ToArray();
            var randomArtist = artists.ElementAt(randomizer.NextDecreasing(artists.Length));

            var tracks = await trackRepository.GetArtistTracks(randomArtist);

            return await GetRandomTrack(randomArtist.Name, tracks.ToArray());
        }

        private async Task<TrackInfo> GetRandomTrack(string artist, IReadOnlyCollection<Track> tracks)
        {
            var track = tracks.ElementAt(randomizer.NextStandard(tracks.Count));
            var info  = await lastfmApi.GetTrackInfo(artist, track.Name);

            return info ?? new TrackInfo(track.Name, null, track.Artist);
        }
    }
}