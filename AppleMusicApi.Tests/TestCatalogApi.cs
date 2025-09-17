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
    public async Task Search_Returns_Valid_SearchResult()
    {
        const string searchResponse = """
                                      {
                                          "results": {
                                              "artists": {
                                                  "data": [
                                                      {
                                                          "id": "136975",
                                                          "type": "artists",
                                                          "href": "/v1/catalog/us/artists/136975",
                                                          "attributes": {},
                                                          "relationships": {}
                                                      }
                                                  ]
                                              },
                                              "albums": {
                                                  "data": []
                                              },
                                              "songs": null
                                          }
                                      }
                                      """;

        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/search?term=Beatles&limit=100&offset=0&types=artists"))
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
        const string searchResponse = """
                                      {
                                          "results": {
                                              "artists": { "data": [] },
                                              "albums": { "data": [] },
                                              "songs": null
                                          }
                                      }
                                      """;

        mockHttpHandler
            .When(matching =>
            {
                matching.RequestUri("https://api.music.apple.com/v1/catalog/us/search?term=Beatles&limit=25&offset=50&types=artists");
                matching.QueryString("term", "Beatles");
                matching.QueryString("limit", "25");
                matching.QueryString("offset", "50");
            })
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(searchResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var searchParams = new SearchParams("Beatles", ResourceType.Artists, 25, 50);
        var result = await catalogApi.Search(searchParams, "us");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Artists, Is.Not.Null);
        Assert.That(result.Albums, Is.Not.Null);
    }

    [Test]
    public async Task GetArtist_Returns_Valid_Artist()
    {
        const string artistResponse = """
                                      {
                                          "data": [
                                              {
                                                  "id": "136975",
                                                  "type": "artists",
                                                  "href": "/v1/catalog/us/artists/136975",
                                                  "attributes": {},
                                                  "relationships": {}
                                              }
                                          ]
                                      }
                                      """;

        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/artists/136975"))
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
        const string artistResponse = """
                                      {
                                          "data": []
                                      }
                                      """;

        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/artists/nonexistent"))
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
        const string albumsResponse = """
                                      {
                                          "data": [
                                              {
                                                  "id": "1441164670",
                                                  "type": "albums",
                                                  "href": "/v1/catalog/us/albums/1441164670",
                                                  "attributes": {},
                                                  "relationships": {}
                                              },
                                              {
                                                  "id": "1441164671",
                                                  "type": "albums",
                                                  "href": "/v1/catalog/us/albums/1441164671",
                                                  "attributes": {},
                                                  "relationships": {}
                                              }
                                          ]
                                      }
                                      """;

        mockHttpHandler
            .When(matching =>
            {
                matching.RequestUri("https://api.music.apple.com/v1/catalog/us/albums?ids=1441164670,1441164671");
                matching.QueryString("ids", "1441164670,1441164671");
            })
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(albumsResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var albumIds = new[] { "1441164670", "1441164671" };
        var result = await catalogApi.GetAlbums(albumIds, "us");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result.First().Id, Is.EqualTo("1441164670"));
        Assert.That(result.Last().Id, Is.EqualTo("1441164671"));
    }

    [Test]
    public async Task GetAlbums_Returns_Empty_When_No_Data()
    {
        const string albumsResponse = """
                                      {
                                          "data": []
                                      }
                                      """;

        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/albums?ids=nonexistent"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(albumsResponse, System.Text.Encoding.UTF8, "application/json")
            });

        var albumIds = new[] { "nonexistent" };
        var result   = await catalogApi.GetAlbums(albumIds, "us");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(0));
    }

    [Test]
    public void Search_Throws_Exception_On_Error_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/search?term=Beatles&limit=100&offset=0&types=artists"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.BadRequest));

        var searchParams = new SearchParams("Beatles", ResourceType.Artists);

        Assert.That(() => catalogApi.Search(searchParams, "us"),
                    Throws.Exception.With.Message.EqualTo("API request GET catalog/us/search?term=Beatles&limit=100&offset=0&types=artists failed with status BadRequest"));
    }

    [Test]
    public void Search_Throws_Exception_On_Null_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/search?term=Beatles&limit=100&offset=0&types=artists"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new  StringContent("null", System.Text.Encoding.UTF8, "application/json")
            });

        var searchParams = new SearchParams("Beatles", ResourceType.Artists);

        Assert.That(() => catalogApi.Search(searchParams, "us"),
                    Throws.Exception.With.Message.EqualTo("Response content is null."));
    }

    [Test]
    public void GetArtist_Throws_Exception_On_Error_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/artists/136975"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.NotFound));

        Assert.That(() => catalogApi.GetArtist("136975", "us"),
                    Throws.Exception.With.Message.EqualTo("API request GET catalog/us/artists/136975 failed with status NotFound"));
    }

    [Test]
    public void GetArtist_Throws_Exception_On_Null_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/artists/136975"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new  StringContent("null", System.Text.Encoding.UTF8, "application/json")
            });

        Assert.That(() => catalogApi.GetArtist("136975", "us"),
                    Throws.Exception.With.Message.EqualTo("Response content is null."));
    }

    [Test]
    public void GetAlbums_Throws_Exception_On_Error_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/albums?ids=1441164670"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.Unauthorized));

        var albumIds = new[] { "1441164670" };

        Assert.That(() => catalogApi.GetAlbums(albumIds, "us"),
                    Throws.Exception.With.Message.EqualTo("API request GET catalog/us/albums?ids=1441164670 failed with status Unauthorized"));
    }

    [Test]
    public void GetAlbums_Throws_Exception_On_Null_Response()
    {
        mockHttpHandler
            .When(matching => matching.RequestUri("https://api.music.apple.com/v1/catalog/us/albums?ids=1441164670"))
            .Respond(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("null", System.Text.Encoding.UTF8, "application/json")
            });

        var albumIds = new[] { "1441164670" };
        Assert.That(() => catalogApi.GetAlbums(albumIds, "us"),
                    Throws.Exception.With.Message.EqualTo("Response content is null."));
    }
}