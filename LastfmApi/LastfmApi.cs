using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using LastfmApi.Models;
using LastfmApi.Models.Search;
using LastfmApi.Models.Serializers;
using Newtonsoft.Json;

namespace LastfmApi
{
    public class LastfmApi : ILastfmApi
    {
        private readonly HttpClient _httpClient = new HttpClient
            { BaseAddress = new Uri("https://ws.audioscrobbler.com/2.0/") };

        public async Task<IEnumerable<Artist>> GetSimilarArtists(string name)
        {
            var query = LastfmQuery.Method("artist.getsimilar")
                .AddParam("artist", name)
                .AddParam("autocorrect", "1")
                .Build();
            var response = await _httpClient.GetAsync(query);
            var json     = await response.Content.ReadAsStringAsync();

            var similarArtistsResponse = JsonConvert.DeserializeObject<SimilarArtistsResponse>(json);

            return similarArtistsResponse.Error == 0
                ? similarArtistsResponse.SimilarArtists.Artists
                : new Artist[0];
        }

        public async Task<IEnumerable<Track>> GetTopTracks(string artist)
        {
            var query = LastfmQuery.Method("artist.gettoptracks")
                .AddParam("artist", artist)
                .AddParam("autocorrect", "1")
                .Build();
            var response = await _httpClient.GetAsync(query);

            if (response.StatusCode != HttpStatusCode.OK)
                return null;

            var json = await response.Content.ReadAsStringAsync();

            var topTracksResponse =
                JsonConvert.DeserializeObject<TopTracksResponse>(json, new TopTracksJsonConverter());

            return topTracksResponse.Error == 0
                ? topTracksResponse.TopTracks.Tracks ?? Enumerable.Empty<Track>()
                : null;
        }

        public async Task<TrackInfo> GetTrackInfo(string artist, string track)
        {
            var query = LastfmQuery.Method("track.getInfo")
                .AddParam("artist", artist)
                .AddParam("track", track)
                .Build();

            var response = await _httpClient.GetAsync(query);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();

            var trackInfoResponse = JsonConvert.DeserializeObject<TrackInfoResponse>(json);

            return trackInfoResponse.Error != 0 ? null : trackInfoResponse.Track;
        }

        public async Task<IEnumerable<Artist>> GetTagArtists(string tag, int page = 1, int limit = 50)
        {
            var query = LastfmQuery.Method("tag.getTopArtists")
                .AddParam("limit", limit.ToString(CultureInfo.InvariantCulture))
                .AddParam("page", page.ToString(CultureInfo.InvariantCulture))
                .AddParam("tag", tag)
                .Build();
            var response = await _httpClient.GetAsync(query);
            var json     = await response.Content.ReadAsStringAsync();

            var topArtistsResponse = JsonConvert.DeserializeObject<TopArtistsResponse>(json);

            if (topArtistsResponse.Error != 0)
            {
                //Log.Warn($"Error when accessing last.fm api. Error code: {topArtistsResponse.Error}.");
                return new Artist[0];
            }

            return topArtistsResponse.TopArtists.Artists;
        }

        public async Task<IEnumerable<Artist>> GetUserArtists(string user, int page = 1, int limit = 50, string period = "overall")
        {
            var query = LastfmQuery.Method("user.getTopArtists")
                .AddParam("limit", limit.ToString(CultureInfo.InvariantCulture))
                .AddParam("page", page.ToString(CultureInfo.InvariantCulture))
                .AddParam("user", user)
                .AddParam("period", period)
                .Build();

            var response = await _httpClient.GetAsync(query);
            var json     = await response.Content.ReadAsStringAsync();

            var topArtistsResponse = JsonConvert.DeserializeObject<TopArtistsResponse>(json);

            if (topArtistsResponse.Error != 0)
            {
                return new Artist[0];
            }

            return topArtistsResponse.TopArtists.Artists;
        }

        public async Task<User> GetUserInfo(string sessionKey, string user = null)
        {
            var query = LastfmQuery.AuthorizableMethod("user.getInfo", sessionKey);

            if (user != null)
                query.AddParam("user", user);

            var response = await _httpClient.GetAsync(query.Build());
            var json     = await response.Content.ReadAsStringAsync();

            var userInfoResponse = JsonConvert.DeserializeObject<UserInfoResponse>(json);

            return userInfoResponse.User;
        }

        public async Task NowPlaying(string artist, string track, TimeSpan duration, string sessionKey)
        {
            const string method = "track.updateNowPlaying";
            var query = LastfmQuery.AuthorizableMethod(method, sessionKey)
                .AddParam("artist", artist)
                .AddParam("track", track)
                .AddParam("duration", duration.TotalSeconds.ToString(CultureInfo.InvariantCulture));
            _httpClient.DefaultRequestHeaders.ExpectContinue = false;
            await _httpClient.PostAsync(string.Empty, query.AsFormUrlEncodedContent());
        }

        public async Task Scrobble(string artist, string track, string sessionKey)
        {
            const string method = "track.scrobble";
            var timestamp =
                Math.Floor(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1, 0, 0, 0)).TotalSeconds);
            var query = LastfmQuery.AuthorizableMethod(method, sessionKey)
                .AddParam("artist", artist)
                .AddParam("track", track)
                .AddParam("timestamp", timestamp.ToString(CultureInfo.InvariantCulture));
            _httpClient.DefaultRequestHeaders.ExpectContinue = false;
            await _httpClient.PostAsync(string.Empty, query.AsFormUrlEncodedContent());
        }

        public Task<Uri> StartWebAuthentication(Uri redirectUrl)
        {
            return Task.FromResult(new Uri($"http://www.last.fm/api/auth?api_key={LastfmQuery.ApiKey}&cb={redirectUrl}"));
        }

        public async Task<string> CompleteAuthentication(string accessToken)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
                throw new ArgumentException(nameof(accessToken));

            var requestUri      = LastfmQuery.GetSession(accessToken).Build();
            var sessionResponse = await _httpClient.GetAsync(requestUri);

            if (sessionResponse.StatusCode != HttpStatusCode.OK)
                return null;

            var sessionJson = await sessionResponse.Content.ReadAsStringAsync();

            return JsonConvert.DeserializeObject<GetSessionResponse>(sessionJson)
                .Session
                .Key;
        }
        
        public async Task<IEnumerable<Artist>> SearchArtists(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException(nameof(name));

            var query = LastfmQuery.Method("artist.search")
                .AddParam("artist", name)
                .Build();
            
            var response = await _httpClient.GetAsync(query);
            var json     = await response.Content.ReadAsStringAsync();

            var searchResponse = JsonConvert.DeserializeObject<SearchResponse>(json);

            return searchResponse.Results.ArtistMatches.Artist;
        }
    }
}