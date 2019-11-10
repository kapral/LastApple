using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class TrackRepository : ITrackRepository
    {
        private readonly ConcurrentDictionary<string, object> artistLocks
            = new ConcurrentDictionary<string, object>();

        private readonly IDictionary<string, CacheItems<Track>> tracksByArtist
            = new Dictionary<string, CacheItems<Track>>();

        private readonly ILastfmApi lastfmApi;

        public TrackRepository(ILastfmApi lastfmApi)
        {
            this.lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        public Task<IEnumerable<Track>> GetArtistTracks(
            Artist artist)
        {
            if (artist == null) throw new ArgumentNullException(nameof(artist));

            lock (artistLocks.GetOrAdd(artist.Name, new object()))
            {
                tracksByArtist.TryGetValue(artist.Name, out var cachedTracks);

                cachedTracks??=new CacheItems<Track>();
                tracksByArtist[artist.Name] = cachedTracks;

                if (cachedTracks.Task?.Status < TaskStatus.RanToCompletion)
                    return cachedTracks.Task;

                if (cachedTracks.Items != null)
                    return Task.FromResult(cachedTracks.Items);

                if(cachedTracks.Attempts >= Constants.MaxRetryAttempts)
                    return Task.FromResult(Enumerable.Empty<Track>());

                return LoadTracks(artist, cachedTracks);
            }
        }

        public bool ArtistHasTracks(Artist artist)
        {
            return !tracksByArtist.TryGetValue(artist.Name, out var tracks) || !tracks.HasNoData;
        }

        private Task<IEnumerable<Track>> LoadTracks(Artist artist, CacheItems<Track> cachedTracks)
        {
            cachedTracks.Task = lastfmApi.GetTopTracks(artist.Name).ContinueWith(x => SetContent(x, cachedTracks));

            cachedTracks.Attempts++;

            return cachedTracks.Task;
        }

        private static IEnumerable<Track> SetContent(Task<IEnumerable<Track>> previousTask, CacheItems<Track> cacheItems)
        {
            if (previousTask.IsCompletedSuccessfully)
                cacheItems.Items = previousTask.Result;

            return previousTask.Result ?? Enumerable.Empty<Track>();
        }
    }
}