using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastfmApi.Models;

namespace LastApple.PlaylistGeneration
{
    public class StationDataCache : IStationDataCache
    {
        private readonly ConcurrentDictionary<string, object> artistLocks
            = new ConcurrentDictionary<string, object>();

        private readonly IDictionary<string, CacheItems<Track>> tracksByArtist
            = new Dictionary<string, CacheItems<Track>>();

        private readonly IDictionary<IStationDefinition, CacheItems<Artist>> artists
            = new Dictionary<IStationDefinition, CacheItems<Artist>>();

        private const int LoadRetryAttempts = 3;

        public Task<IEnumerable<Track>> GetArtistTracks(
            Artist artist,
            Func<Task<IEnumerable<Track>>> getTracks)
        {
            if (artist == null) throw new ArgumentNullException(nameof(artist));
            if (getTracks == null) throw new ArgumentNullException(nameof(getTracks));

            lock (artistLocks.GetOrAdd(artist.Name, new object()))
            {
                tracksByArtist.TryGetValue(artist.Name, out var cachedTracks);

                cachedTracks??=new CacheItems<Track>();
                tracksByArtist[artist.Name] = cachedTracks;

                if (cachedTracks.Task?.Status < TaskStatus.RanToCompletion)
                    return cachedTracks.Task;

                if (cachedTracks.Items != null)
                    return Task.FromResult(cachedTracks.Items);

                if(cachedTracks.Attempts >= LoadRetryAttempts)
                    return Task.FromResult(Enumerable.Empty<Track>());

                return LoadTracks(getTracks, cachedTracks);
            }
        }

        public async Task<IEnumerable<Artist>> GetArtists(
            IStationDefinition definition,
            Func<Task<IEnumerable<Artist>>> getArtists)
        {
            if (definition == null) throw new ArgumentNullException(nameof(definition));
            if (getArtists == null) throw new ArgumentNullException(nameof(getArtists));

            if (artists.TryGetValue(definition, out var cachedArtists) && cachedArtists.Items != null)
                return FilterArtists(cachedArtists.Items);

            cachedArtists??=new CacheItems<Artist>();
            artists[definition] = cachedArtists;

            if (cachedArtists.Attempts >= LoadRetryAttempts)
                return Enumerable.Empty<Artist>();

            return await LoadArtists(getArtists, cachedArtists);
        }

        private async Task<IEnumerable<Artist>> LoadArtists(Func<Task<IEnumerable<Artist>>> getArtists, CacheItems<Artist> cachedArtists)
        {
            cachedArtists.Attempts++;

            cachedArtists.Items = await getArtists();

            return FilterArtists(cachedArtists.Items ?? Enumerable.Empty<Artist>());
        }

        private static Task<IEnumerable<Track>> LoadTracks(Func<Task<IEnumerable<Track>>> getTracks, CacheItems<Track> cachedTracks)
        {
            cachedTracks.Task = getTracks().ContinueWith(x => SetContent(x, cachedTracks));

            cachedTracks.Attempts++;

            return cachedTracks.Task;
        }

        private static IEnumerable<Track> SetContent(Task<IEnumerable<Track>> previousTask, CacheItems<Track> cacheItems)
        {
            if (previousTask.IsCompletedSuccessfully)
                cacheItems.Items = previousTask.Result;

            return previousTask.Result ?? Enumerable.Empty<Track>();
        }

        private IEnumerable<Artist> FilterArtists(IEnumerable<Artist> source)
            => source.Where(x => !tracksByArtist.TryGetValue(x.Name, out var tracks) || !tracks.HasNoData);

        private class CacheItems<TItem>
        {
            public int Attempts { get; set; }

            public IEnumerable<TItem> Items { get; set; }

            public Task<IEnumerable<TItem>> Task { get; set; }

            public bool HasNoData => Attempts >= LoadRetryAttempts && Items == null || Items?.Any() == false;
        }
    }
}