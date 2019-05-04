using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class LastfmCache : ILastfmCache
    {
        private readonly IDictionary<string, Track[]> _tracks = new Dictionary<string, Track[]>();

        private readonly IDictionary<IStationDefinition, IEnumerable<Artist>> _artists =
            new Dictionary<IStationDefinition, IEnumerable<Artist>>();

        public async Task<IEnumerable<Track>> GetArtistTracks(
            Artist artist,
            Func<Task<IEnumerable<Track>>> getTracks)
        {
            if (_tracks.TryGetValue(artist.Name, out var topTracks))
                return topTracks;

            var tracks = await getTracks() ?? new Track[0];

            topTracks            = tracks.ToArray();
            _tracks[artist.Name] = topTracks;

            return topTracks;
        }

        public async Task<IEnumerable<Artist>> GetArtists(IStationDefinition definition,
            Func<Task<IEnumerable<Artist>>> getArtists)
        {
            if (_artists.TryGetValue(definition, out var artists))
                return artists;

            artists = (await getArtists()).ToArray();

            _artists[definition] = artists;

            return artists;
        }
    }
}