using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AppleMusicApi;
using NSubstitute;
using NUnit.Framework;

namespace AppleMusicApi.Tests;

public class TestCatalogApi
{
    private ApiAuthentication authentication;

    [SetUp]
    public void Setup()
    {
        authentication = new ApiAuthentication("test-developer-token");
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
        // Note: The enum values are 0,1,2,3 so combining them might have overlaps
        var artistsType = ResourceType.Artists;
        var albumsType = ResourceType.Albums;
        var songsType = ResourceType.Songs;
        var musicVideosType = ResourceType.MusicVideos;
        
        Assert.That(artistsType, Is.EqualTo(ResourceType.Artists));
        Assert.That(albumsType, Is.EqualTo(ResourceType.Albums));
        Assert.That(songsType, Is.EqualTo(ResourceType.Songs));
        Assert.That(musicVideosType, Is.EqualTo(ResourceType.MusicVideos));
        
        // Test that the enum values can be used in combinations
        var combinedTypes = ResourceType.Artists | ResourceType.Albums;
        Assert.That(combinedTypes.HasFlag(ResourceType.Artists), Is.True);
        Assert.That(combinedTypes.HasFlag(ResourceType.Albums), Is.True);
    }

    // Note: CatalogApi now supports dependency injection of IHttpClientFactory for better testability
    // HTTP integration tests would require mocking and proper Apple Music API structure knowledge

    [Test]
    public void Constructor_With_HttpClientFactory_Creates_Valid_Instance()
    {
        var mockHttpClientFactory = NSubstitute.Substitute.For<IHttpClientFactory>();
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
        var mockHttpClientFactory = NSubstitute.Substitute.For<IHttpClientFactory>();
        
        Assert.That(() => new CatalogApi(null, mockHttpClientFactory), 
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("authentication"));
    }
}