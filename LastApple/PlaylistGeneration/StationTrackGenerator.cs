using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Model;

namespace LastApple.PlaylistGeneration
{
    public class StationTrackGenerator<TStation> : IStationTrackGenerator<TStation> where TStation : IStationDefinition
    {
        private readonly IRandomizer randomizer;
        private readonly ITrackRepository trackRepository;
        private readonly IStationSource<TStation> stationSource;

        public StationTrackGenerator(IRandomizer randomizer,
                                     ITrackRepository trackRepository,
                                     IStationSource<TStation> stationSource)
        {
            this.randomizer = randomizer ?? throw new ArgumentNullException(nameof(randomizer));
            this.trackRepository = trackRepository ?? throw new ArgumentNullException(nameof(trackRepository));
            this.stationSource = stationSource ?? throw new ArgumentNullException(nameof(stationSource));
        }

        public async Task<Track> GetNext(TStation station)
        {
            if (station == null) throw new ArgumentNullException(nameof(station));

            var artists      = (await stationSource.GetStationArtists(station)).ToArray();
            var randomArtist = artists.ElementAt(randomizer.NextDecreasing(artists.Length));
            var tracks       = await trackRepository.GetArtistTracks(randomArtist);

            return tracks.ElementAt(randomizer.NextStandard(tracks.Count));
        }
    }
}