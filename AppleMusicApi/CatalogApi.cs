using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;

namespace AppleMusicApi;

public class CatalogApi : ICatalogApi
{
    private readonly HttpClient httpClient;

    public CatalogApi(ApiAuthentication authentication)
    {
        if (authentication == null) throw new ArgumentNullException(nameof(authentication));

        httpClient = new HttpClient { BaseAddress = new Uri("https://api.music.apple.com/v1/") };

        httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", authentication.DeveloperToken);
    }

    public async Task<SearchResult> Search(SearchParams searchParams, string storefront)
    {
        var parameters = new Dictionary<string, string>
        {
            { "term", searchParams.Term },
            { "limit", searchParams.Limit.ToString() },
            { "offset", searchParams.Offset.ToString() },
            { "types", SerializeTypes(searchParams.Types) }
        };

        var httpResponse = await httpClient.GetAsync(QueryHelpers.AddQueryString($"catalog/{storefront}/search", parameters));

        if(!httpResponse.IsSuccessStatusCode)
            throw new Exception("todo");

        var apiResponse = await ReadAs<SearchResponse>(httpResponse.Content);

        return apiResponse.Results;
    }

    public async Task<Resource<ArtistAttributes>?> GetArtist(string id, string storefront)
    {
        var httpResponse = await httpClient.GetAsync($"catalog/{storefront}/artists/{id}");

        if(!httpResponse.IsSuccessStatusCode)
            throw new Exception("todo");

        var apiResponse = await ReadAs<ResourceMatches<ArtistAttributes>>(httpResponse.Content);

        return apiResponse.Data.FirstOrDefault();
    }

    public async Task<IEnumerable<Resource<AlbumAttributes>>> GetAlbums(IEnumerable<string> ids, string storefront)
    {
        var httpResponse = await httpClient.GetAsync($"catalog/{storefront}/albums?ids={string.Join(',', ids)}");

        if(!httpResponse.IsSuccessStatusCode)
            throw new Exception("todo");

        var apiResponse = await ReadAs<ResourceMatches<AlbumAttributes>>(httpResponse.Content);

        return apiResponse.Data;
    }

    private static string SerializeTypes(ResourceType types)
    {
        var values = Enum.GetValues(typeof(ResourceType))
                         .Cast<ResourceType>()
                         .Where(x => types.HasFlag(x))
                         .Select(x => x.ToString().ToLower());

        return string.Join(",", values);
    }

    private static async Task<T> ReadAs<T>(HttpContent content)
    {
        var options = new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true,
            Converters                  = { new JsonStringEnumMemberConverter() }
        };
        var result   = await JsonSerializer.DeserializeAsync<T>(await content.ReadAsStreamAsync(), options);

        return result ?? throw new InvalidOperationException("Response content is null.");
    }

}