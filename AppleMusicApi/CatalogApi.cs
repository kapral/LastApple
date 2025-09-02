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

public class CatalogApi(ApiAuthentication authentication, IHttpClientFactory httpClientFactory) : ICatalogApi
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters                  = { new JsonStringEnumMemberConverter() }
    };

    public async Task<SearchResult> Search(SearchParams searchParams, string storefront)
    {
        var parameters = new Dictionary<string, string>
        {
            { "term", searchParams.Term },
            { "limit", searchParams.Limit.ToString() },
            { "offset", searchParams.Offset.ToString() },
            { "types", SerializeTypes(searchParams.Types) }
        };

        var httpClient   = CreateHttpClient();
        var uri          = QueryHelpers.AddQueryString($"catalog/{storefront}/search", parameters);
        var httpResponse = await httpClient.GetAsync(uri);

        if (!httpResponse.IsSuccessStatusCode)
        {
            throw new ApiException(HttpMethod.Get, uri, httpResponse.StatusCode);
        }

        var apiResponse = await ReadAs<SearchResponse>(httpResponse.Content);

        return apiResponse.Results;
    }

    public async Task<Resource<ArtistAttributes>?> GetArtist(string id, string storefront)
    {
        var httpClient   = CreateHttpClient();
        var uri          = $"catalog/{storefront}/artists/{id}";
        var httpResponse = await httpClient.GetAsync(uri);

        if (!httpResponse.IsSuccessStatusCode)
        {
            throw new ApiException(HttpMethod.Get, uri, httpResponse.StatusCode);
        }

        var apiResponse = await ReadAs<ResourceMatches<ArtistAttributes>>(httpResponse.Content);

        return apiResponse.Data.FirstOrDefault();
    }

    public async Task<IReadOnlyCollection<Resource<AlbumAttributes>>> GetAlbums(
        IReadOnlyCollection<string> ids, string storefront)
    {
        var httpClient   = CreateHttpClient();
        var uri          = $"catalog/{storefront}/albums?ids={string.Join(',', ids)}";
        var httpResponse = await httpClient.GetAsync(uri);

        if (!httpResponse.IsSuccessStatusCode)
        {
            throw new ApiException(HttpMethod.Get, uri, httpResponse.StatusCode);
        }

        var apiResponse = await ReadAs<ResourceMatches<AlbumAttributes>>(httpResponse.Content);

        return apiResponse.Data.ToArray();
    }

    private HttpClient CreateHttpClient()
    {
        var httpClient = httpClientFactory.CreateClient();
        httpClient.BaseAddress = new Uri("https://api.music.apple.com/v1/");

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authentication.DeveloperToken);

        return httpClient;
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
        var result = await JsonSerializer.DeserializeAsync<T>(await content.ReadAsStreamAsync(), JsonSerializerOptions);

        return result ?? throw new InvalidOperationException("Response content is null.");
    }

}