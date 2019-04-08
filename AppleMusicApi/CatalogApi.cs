using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;

namespace AppleMusicApi
{
    public class CatalogApi : ICatalogApi
    {
        private readonly HttpClient _httpClient;

        public CatalogApi(ApiAuthentication authentication)
        {
            if (authentication == null) throw new ArgumentNullException(nameof(authentication));

            _httpClient = new HttpClient { BaseAddress = new Uri("https://api.music.apple.com/v1/") };

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", authentication.DeveloperToken);
        }

        public async Task<SearchResult> Search(SearchParams searchParams)
        {
            var parameters = new Dictionary<string, string>
            {
                { "term", searchParams.Term },
                { "limit", searchParams.Limit.ToString() },
                { "offset", searchParams.Offset.ToString() },
                { "types", SerializeTypes(searchParams.Types) }
            };

            var httpResponse = await _httpClient.GetAsync(QueryHelpers.AddQueryString("catalog/ru/search", parameters));

            if(!httpResponse.IsSuccessStatusCode)
                throw new Exception("todo");

            var apiResponse = await httpResponse.Content.ReadAsAsync<SearchResponse>();

            return apiResponse.Results;
        }

        private static string SerializeTypes(ResourceType types)
        {
            var values = Enum.GetValues(typeof(ResourceType))
                .Cast<ResourceType>()
                .Where(x => types.HasFlag(x))
                .Select(x => x.ToString().ToLower());

            return string.Join(",", values);
        }
    }
}