using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LastfmApi.Api;

namespace LastfmApi {
    public interface ILastfmApi {
        bool IsAuthenticated { get; }

        Task<IEnumerable<Artist>> GetSimilarArtists(string name);

        Task<IEnumerable<Track>> GetTopTracks(string artist);

        Task NowPlaying(string artist, string track, TimeSpan duration);

        Task Scrobble(string artist, string track);

        Task<Uri> StartDesktopAuthentication();

        Task<Uri> StartWebAuthentication(Uri redirectUrl);

        Task<bool> CompleteAuthentication(string token = null);

        Task<TrackInfo> GetTrackInfo(string artist, string track);

        Task<IEnumerable<Artist>> GetTagArtists(string tag, int page = 1, int limit = 50);

        Task<IEnumerable<Artist>> GetUserArtists(string user, int page = 1, int limit = 50);
    }
}