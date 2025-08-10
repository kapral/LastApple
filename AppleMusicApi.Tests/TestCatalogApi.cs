using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AppleMusicApi;
using NSubstitute;
using NUnit.Framework;
using MockHttp;

namespace AppleMusicApi.Tests;

public class TestCatalogApi
{
    private ApiAuthentication authentication;
    private MockHttpHandler mockHttpHandler;
    private IHttpClientFactory httpClientFactory;
    private CatalogApi catalogApi;

    [SetUp]
    public void Setup()
    {
        authentication = new ApiAuthentication("test-developer-token");
        mockHttpHandler = new MockHttpHandler();
        
        httpClientFactory = Substitute.For<IHttpClientFactory>();
        httpClientFactory.CreateClient(Arg.Any<string>()).Returns(new HttpClient(mockHttpHandler));
        
        catalogApi = new CatalogApi(authentication, httpClientFactory);
    }

    [Test]
    public void Constructor_Throws_On_Null_Authentication()
    {
        Assert.That(() => new CatalogApi(null), 
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("authentication"));
    }

    [Test]
    public void Constructor_Creates_Valid_Instance()
    {
        var api = new CatalogApi(authentication);
        
        Assert.That(api, Is.Not.Null);
        Assert.That(api, Is.InstanceOf<ICatalogApi>());
    }

    [Test]
    public void Constructor_With_HttpClientFactory_Creates_Valid_Instance()
    {
        var mockHttpClientFactory = Substitute.For<IHttpClientFactory>();
        mockHttpClientFactory.CreateClient(Arg.Any<string>()).Returns(new HttpClient());
        
        var api = new CatalogApi(authentication, mockHttpClientFactory);
        
        Assert.That(api, Is.Not.Null);
        Assert.That(api, Is.InstanceOf<ICatalogApi>());
    }

    [Test]
    public void Constructor_With_HttpClientFactory_Throws_On_Null_Factory()
    {
        Assert.That(() => new CatalogApi(authentication, null), 
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("httpClientFactory"));
    }

    [Test]
    public void Constructor_With_HttpClientFactory_Throws_On_Null_Authentication()
    {
        var mockHttpClientFactory = Substitute.For<IHttpClientFactory>();
        
        Assert.That(() => new CatalogApi(null, mockHttpClientFactory), 
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("authentication"));
    }

    [Test]
    public async Task Search_Returns_Valid_SearchResult()
    {
        var searchResponse = @"{
            ""results"": {
                ""artists"": {
                    ""data"": [
                        {
                            ""id"": ""136975"",
                            ""type"": ""artists"",
                            ""href"": ""/v1/catalog/us/artists/136975"",
                            ""attributes"": {},
                            ""relationships"": {}
                        }
                    ]
                },
                ""albums"": {
                    ""data"": []
                },
                ""songs"": null
            }
        }";

        mockHttpHandler
            .When(matching => matching.RequestUri("*/catalog/us/search*"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(searchResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var searchParams = new SearchParams("Beatles", ResourceType.Artists);
        var result = await catalogApi.Search(searchParams, "us");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Artists.Data, Has.Count.EqualTo(1));
        Assert.That(result.Artists.Data.First().Id, Is.EqualTo("136975"));
    }

    [Test]
    public async Task Search_Sends_Correct_Parameters()
    {
        var searchResponse = @"{
            ""results"": {
                ""artists"": { ""data"": [] },
                ""albums"": { ""data"": [] },
                ""songs"": null
            }
        }";

        mockHttpHandler
            .When(matching => 
            {
                matching.RequestUri("*/catalog/us/search*");
                matching.QueryString("term", "Beatles");
                matching.QueryString("limit", "25");
                matching.QueryString("offset", "50");
            })
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(searchResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var searchParams = new SearchParams("Beatles", ResourceType.Artists, 25, 50);
        await catalogApi.Search(searchParams, "us");
    }

    [Test]
    public async Task GetArtist_Returns_Valid_Artist()
    {
        var artistResponse = @"{
            ""data"": [
                {
                    ""id"": ""136975"",
                    ""type"": ""artists"",
                    ""href"": ""/v1/catalog/us/artists/136975"",
                    ""attributes"": {},
                    ""relationships"": {}
                }
            ]
        }";

        mockHttpHandler
            .When(matching => matching.RequestUri("*/catalog/us/artists/136975"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(artistResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var result = await catalogApi.GetArtist("136975", "us");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo("136975"));
    }

    [Test]
    public async Task GetArtist_Returns_Null_When_No_Data()
    {
        var artistResponse = @"{
            ""data"": []
        }";

        mockHttpHandler
            .When(matching => matching.RequestUri("*/catalog/us/artists/nonexistent"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(artistResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var result = await catalogApi.GetArtist("nonexistent", "us");

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task GetAlbums_Returns_Valid_Albums()
    {
        var albumsResponse = @"{
            ""data"": [
                {
                    ""id"": ""1441164670"",
                    ""type"": ""albums"",
                    ""href"": ""/v1/catalog/us/albums/1441164670"",
                    ""attributes"": {},
                    ""relationships"": {}
                },
                {
                    ""id"": ""1441164671"",
                    ""type"": ""albums"",
                    ""href"": ""/v1/catalog/us/albums/1441164671"",
                    ""attributes"": {},
                    ""relationships"": {}
                }
            ]
        }";

        mockHttpHandler
            .When(matching => 
            {
                matching.RequestUri("*/catalog/us/albums*");
                matching.QueryString("ids", "1441164670,1441164671");
            })
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(albumsResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var albumIds = new[] { "1441164670", "1441164671" };
        var result = await catalogApi.GetAlbums(albumIds, "us");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count(), Is.EqualTo(2));
        Assert.That(result.First().Id, Is.EqualTo("1441164670"));
        Assert.That(result.Last().Id, Is.EqualTo("1441164671"));
    }

    [Test]
    public async Task GetAlbums_Returns_Empty_When_No_Data()
    {
        var albumsResponse = @"{
            ""data"": []
        }";

        mockHttpHandler
            .When(matching => matching.RequestUri("*/catalog/us/albums*"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(albumsResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var albumIds = new[] { "nonexistent" };
        var result = await catalogApi.GetAlbums(albumIds, "us");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count(), Is.EqualTo(0));
    }

    [Test]
    public void Search_Throws_Exception_On_Error_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("*/catalog/us/search*"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.BadRequest));

        var searchParams = new SearchParams("Beatles", ResourceType.Artists);
        
        Assert.That(async () => await catalogApi.Search(searchParams, "us"), 
            Throws.Exception.With.Message.EqualTo("todo"));
    }

    [Test]
    public void GetArtist_Throws_Exception_On_Error_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("*/catalog/us/artists/136975"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.NotFound));

        Assert.That(async () => await catalogApi.GetArtist("136975", "us"), 
            Throws.Exception.With.Message.EqualTo("todo"));
    }

    [Test]
    public void GetAlbums_Throws_Exception_On_Error_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("*/catalog/us/albums*"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.Unauthorized));

        var albumIds = new[] { "1441164670" };
        
        Assert.That(async () => await catalogApi.GetAlbums(albumIds, "us"), 
            Throws.Exception.With.Message.EqualTo("todo"));
    }

    [Test]
    public void ApiAuthentication_Stores_Token_Correctly()
    {
        var token = "test-token-123";
        var auth = new ApiAuthentication(token);
        
        Assert.That(auth.DeveloperToken, Is.EqualTo(token));
    }

    [Test]
    public void SearchParams_Creates_With_Default_Values()
    {
        var searchParams = new SearchParams("Beatles", ResourceType.Artists);
        
        Assert.That(searchParams.Term, Is.EqualTo("Beatles"));
        Assert.That(searchParams.Types, Is.EqualTo(ResourceType.Artists));
        Assert.That(searchParams.Limit, Is.EqualTo(100));
        Assert.That(searchParams.Offset, Is.EqualTo(0));
    }

    [Test]
    public void SearchParams_Creates_With_Custom_Values()
    {
        var searchParams = new SearchParams("Beatles", ResourceType.Artists | ResourceType.Albums, 25, 50);
        
        Assert.That(searchParams.Term, Is.EqualTo("Beatles"));
        Assert.That(searchParams.Types, Is.EqualTo(ResourceType.Artists | ResourceType.Albums));
        Assert.That(searchParams.Limit, Is.EqualTo(25));
        Assert.That(searchParams.Offset, Is.EqualTo(50));
    }

    [Test]
    public void ResourceType_Flags_Work_Correctly()
    {
        var artistsType = ResourceType.Artists;
        var albumsType = ResourceType.Albums;
        var songsType = ResourceType.Songs;
        var musicVideosType = ResourceType.MusicVideos;
        
        Assert.That(artistsType, Is.EqualTo(ResourceType.Artists));
        Assert.That(albumsType, Is.EqualTo(ResourceType.Albums));
        Assert.That(songsType, Is.EqualTo(ResourceType.Songs));
        Assert.That(musicVideosType, Is.EqualTo(ResourceType.MusicVideos));
        
        var combinedTypes = ResourceType.Artists | ResourceType.Albums;
        Assert.That(combinedTypes.HasFlag(ResourceType.Artists), Is.True);
        Assert.That(combinedTypes.HasFlag(ResourceType.Albums), Is.True);
    }
}