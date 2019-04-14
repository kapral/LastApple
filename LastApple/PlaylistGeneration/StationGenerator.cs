using System;
using System.Linq;
using System.Threading.Tasks;
using LastApple.Model;
using LastfmPlayer.Core.PlaylistGeneration;

namespace LastApple.PlaylistGeneration {
    public class StationGenerator<TStation> : IStationGenerator<TStation> where TStation : IStationDefinition {
        private readonly IStationTrackGenerator<TStation> _trackGenerator;
        private readonly ITrackIdProvider _trackIdProvider;
        private readonly IStationEventMediator _stationEventMediator;

        private const int AttemptsLimit = 50;

        public StationGenerator(IStationTrackGenerator<TStation> stationTrackGenerator,
            ITrackIdProvider trackIdProvider,
            IStationEventMediator stationEventMediator)
        {
            _trackGenerator  = stationTrackGenerator ?? throw new ArgumentNullException(nameof(stationTrackGenerator));
            _trackIdProvider = trackIdProvider ?? throw new ArgumentNullException(nameof(trackIdProvider));
            _stationEventMediator = stationEventMediator ?? throw new ArgumentNullException(nameof(stationEventMediator));
        }

        public async Task Generate(Station<TStation> station) {
            _trackGenerator.Station = station.Definition;

            await Populate(station);
        }

        private async Task Populate(Station<TStation> station)
        {
            var attempts = 0;

            while (station.SongIds.Count < station.Size)
            {
                attempts++;
                if(attempts > AttemptsLimit)
                    return;

                var nextTrack = await _trackGenerator.GetNext();
                if (nextTrack == null)
                    continue;

                var trackId = await _trackIdProvider.FindTrackId(nextTrack.Artist.Name, nextTrack.Name);
                if (trackId == null)
                    continue;

                if (station.SongIds.Any(trackId.Equals))
                    continue;

                station.SongIds.Add(trackId);
                _stationEventMediator.NotifyTrackAdded(station.Id, trackId, station.SongIds.Count - 1);
                attempts = 0;
            }
        }
    }
}