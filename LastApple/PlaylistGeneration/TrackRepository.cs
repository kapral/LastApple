using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class TrackRepository(IArtistApi artistApi) : ITrackRepository
{
    private readonly ConcurrentDictionary<string, object> artistLocks = new();

    private readonly Dictionary<string, CacheItems<Track>> tracksByArtist = new();

    private readonly IArtistApi artistApi = artistApi ?? throw new ArgumentNullException(nameof(artistApi));

    public Task<IReadOnlyCollection<Track>> GetArtistTracks(
        Artist artist)
    {
        if (artist == null) throw new ArgumentNullException(nameof(artist));

        lock (artistLocks.GetOrAdd(artist.Name, () => new object()))
        {
            tracksByArtist.TryGetValue(artist.Name, out var cachedTracks);

            cachedTracks                ??= new CacheItems<Track>();
            tracksByArtist[artist.Name] =   cachedTracks;

            // TODO: convert to switch expression
            if (cachedTracks.Task?.Status < TaskStatus.RanToCompletion)
                return cachedTracks.Task;

            if (cachedTracks.Items != null)
                return Task.FromResult(cachedTracks.Items);

            if (cachedTracks.Attempts >= Constants.MaxRetryAttempts)
                return Task.FromResult<IReadOnlyCollection<Track>>(Array.Empty<Track>());

            return LoadTracks(artist, cachedTracks);
        }
    }

    public bool ArtistHasTracks(Artist artist)
    {
        return !tracksByArtist.TryGetValue(artist.Name, out var tracks) || !tracks.HasNoData;
    }

    private Task<IReadOnlyCollection<Track>> LoadTracks(Artist artist, CacheItems<Track> cachedTracks)
    {
        cachedTracks.Task = artistApi.GetTopTracksAsync(artist.Name).ContinueWith(x => SetContent(x, cachedTracks));

        cachedTracks.Attempts++;

        return cachedTracks.Task;
    }

    private static IReadOnlyCollection<Track> SetContent(Task<PageResponse<LastTrack>> previousTask, CacheItems<Track> cacheItems)
    {
        if (!previousTask.IsCompletedSuccessfully || !previousTask.Result.Success)
            return Array.Empty<Track>();

        cacheItems.Items = ExtractResult(previousTask);

        return cacheItems.Items;
    }

    private static IReadOnlyCollection<Track> ExtractResult(Task<PageResponse<LastTrack>> task)
        => task.Result.Content.Select(x => new Track(ArtistName: x.ArtistName, Name: x.Name)).ToArray();
}