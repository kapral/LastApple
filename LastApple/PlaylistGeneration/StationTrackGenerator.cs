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
    public async Task<Track?> GetNext(TStation station)
    {
        if (station == null) throw new ArgumentNullException(nameof(station));

        var artists      = (await stationSource.GetStationArtists(station)).ToArray();
        var randomArtist = artists.ElementAtOrDefault(randomizer.NextDecreasing(artists.Length));

        if (randomArtist == null)
        {
            return null;
        }

        var tracks = await trackRepository.GetArtistTracks(randomArtist);

        return tracks.ElementAtOrDefault(randomizer.NextStandard(tracks.Count));
    }
}