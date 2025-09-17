using System.Linq;
using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class StationGenerator<TStation>(IStationTrackGenerator<TStation> trackGenerator,
                                        ITrackIdProvider trackIdProvider,
                                        IStationEventMediator stationEventMediator)
    : IStationGenerator<TStation> where TStation : IStationDefinition
{
    private const int AttemptsLimit = 50;

    public async Task Generate(Station<TStation> station, string storefront) {
        await Populate(station, storefront);
    }

    public async Task TopUp(Station<TStation> station, string storefront, int count) {
        await Populate(station, storefront, count);
    }

    private async Task Populate(Station<TStation> station, string storefront, int? topUpCount = null)
    {
        var attempts = 0;

        var targetCount = topUpCount.HasValue ? station.SongIds.Count + topUpCount : station.Size;

        while (station.SongIds.Count < targetCount)
        {
            attempts++;
            if(attempts > AttemptsLimit)
                return;

            var nextTrack = await trackGenerator.GetNext(station.Definition);
            if (nextTrack == null)
            {
                continue;
            }

            var trackId = await trackIdProvider.FindTrackId(nextTrack.ArtistName, nextTrack.Name, storefront);
            if (trackId == null)
            {
                continue;
            }

            if (station.SongIds.Any(trackId.Equals))
            {
                continue;
            }

            station.SongIds.Add(trackId);
            stationEventMediator.NotifyTrackAdded(station.Id, trackId, station.SongIds.Count - 1);
            attempts = 0;
        }
    }
}