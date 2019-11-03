using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public interface IStationDataCache
    {
        Task<IEnumerable<Track>> GetArtistTracks(
            Artist artist,
            Func<Task<IEnumerable<Track>>> getTracks);

        Task<IEnumerable<Artist>> GetArtists(IStationDefinition definition, Func<Task<IEnumerable<Artist>>> getArtists);
    }
}