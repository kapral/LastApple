using System.Collections.Generic;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public interface ITrackRepository
    {
        Task<IEnumerable<Track>> GetArtistTracks(Artist artist);

        bool ArtistHasTracks(Artist artist);
    }
}