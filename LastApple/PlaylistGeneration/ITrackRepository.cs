using System.Collections.Generic;
using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public interface ITrackRepository
{
    Task<IReadOnlyCollection<Track>> GetArtistTracks(Artist artist);

    bool ArtistHasTracks(Artist artist);
}