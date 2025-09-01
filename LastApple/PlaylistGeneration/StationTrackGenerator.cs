using System;
using System.Linq;
using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class StationTrackGenerator<TStation>(IRandomizer randomizer,
                                             ITrackRepository trackRepository,
                                             IStationSource<TStation> stationSource)
    : IStationTrackGenerator<TStation> where TStation : IStationDefinition
{
    private readonly IRandomizer randomizer = randomizer ?? throw new ArgumentNullException(nameof(randomizer));
    private readonly ITrackRepository trackRepository = trackRepository ?? throw new ArgumentNullException(nameof(trackRepository));
    private readonly IStationSource<TStation> stationSource = stationSource ?? throw new ArgumentNullException(nameof(stationSource));

    public async Task<Track> GetNext(TStation station)
    {
        if (station == null) throw new ArgumentNullException(nameof(station));

        var artists      = (await stationSource.GetStationArtists(station)).ToArray();
        var randomArtist = artists.ElementAt(randomizer.NextDecreasing(artists.Length));
        var tracks       = await trackRepository.GetArtistTracks(randomArtist);

        return tracks.ElementAt(randomizer.NextStandard(tracks.Count));
    }
}