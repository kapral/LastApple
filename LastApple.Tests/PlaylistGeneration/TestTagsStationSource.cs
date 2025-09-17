using System.Linq;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration;

public class TestTagsStationSource
{
    private ITagApi tagApi;
    private IStationSource<TagsStationDefinition> source;

    [SetUp]
    public void Setup()
    {
        tagApi = Substitute.For<ITagApi>();
        source = new TagsStationSource(tagApi);
    }

    [Test]
    public async Task GetStationArtists_Returns_Empty_When_No_Artists_Found()
    {
        var definition = new TagsStationDefinition(["rock"]);
        tagApi.GetTopArtistsAsync("rock", 1, 200)
              .Returns(new PageResponse<LastArtist>([]));

        var result = await source.GetStationArtists(definition);

        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task GetStationArtists_Returns_Artists_From_Single_Tag()
    {
        var definition = new TagsStationDefinition(["rock"]);
        var lastfmArtists = new[]
        {
            new LastArtist { Name = "The Beatles" },
            new LastArtist { Name = "Led Zeppelin" },
            new LastArtist { Name = "Pink Floyd" }
        };

        tagApi.GetTopArtistsAsync("rock", 1, 200)
              .Returns(new PageResponse<LastArtist>(lastfmArtists));
        tagApi.GetTopArtistsAsync("rock", Arg.Is<int>(page => page > 1), 200)
              .Returns(new PageResponse<LastArtist>([]));

        var result = await source.GetStationArtists(definition);

        Assert.That(result.Count, Is.EqualTo(3));
        Assert.That(result.Select(a => a.Name), Contains.Item("The Beatles"));
        Assert.That(result.Select(a => a.Name), Contains.Item("Led Zeppelin"));
        Assert.That(result.Select(a => a.Name), Contains.Item("Pink Floyd"));
    }

    [Test]
    public async Task GetStationArtists_Returns_Intersection_For_Multiple_Tags()
    {
        var definition = new TagsStationDefinition(["rock", "classic"]);

        var rockArtists = new[]
        {
            new LastArtist { Name = "The Beatles" },
            new LastArtist { Name = "Led Zeppelin" },
            new LastArtist { Name = "Radiohead" }
        };

        var classicArtists = new[]
        {
            new LastArtist { Name = "The Beatles" },
            new LastArtist { Name = "Pink Floyd" },
            new LastArtist { Name = "Queen" }
        };

        tagApi.GetTopArtistsAsync("rock", Arg.Any<int>(), Arg.Any<int>())
              .Returns(new PageResponse<LastArtist>(rockArtists));
        tagApi.GetTopArtistsAsync("classic", Arg.Any<int>(), Arg.Any<int>())
              .Returns(new PageResponse<LastArtist>(classicArtists));

        var result = await source.GetStationArtists(definition);

        Assert.That(result.Count, Is.EqualTo(1));
        Assert.That(result.First().Name, Is.EqualTo("The Beatles"));
    }

    [Test]
    public async Task GetStationArtists_Continues_To_Next_Page_When_Intersection_Too_Small()
    {
        var definition = new TagsStationDefinition(["rock", "alternative"]);

        var page1RockArtists = new[]
        {
            new LastArtist { Name = "Artist1" },
            new LastArtist { Name = "Artist2" }
        };

        var page1AlternativeArtists = new[]
        {
            new LastArtist { Name = "Artist1" }
        };

        var page2RockArtists = new[]
        {
            new LastArtist { Name = "Artist3" },
            new LastArtist { Name = "Artist4" },
            new LastArtist { Name = "Artist5" },
            new LastArtist { Name = "Artist6" }
        };

        var page2AlternativeArtists = new[]
        {
            new LastArtist { Name = "Artist3" },
            new LastArtist { Name = "Artist4" },
            new LastArtist { Name = "Artist5" },
            new LastArtist { Name = "Artist6" },
            new LastArtist { Name = "Artist7" }
        };

        tagApi.GetTopArtistsAsync("rock", 1, 200).Returns(new PageResponse<LastArtist>(page1RockArtists));
        tagApi.GetTopArtistsAsync("alternative", 1, 200).Returns(new PageResponse<LastArtist>(page1AlternativeArtists));
        tagApi.GetTopArtistsAsync("rock", 2, 200).Returns(new PageResponse<LastArtist>(page2RockArtists));
        tagApi.GetTopArtistsAsync("alternative", 2, 200).Returns(new PageResponse<LastArtist>(page2AlternativeArtists));

        var result = await source.GetStationArtists(definition);

        Assert.That(result.Count, Is.EqualTo(5));
        await tagApi.Received().GetTopArtistsAsync("rock", 1, 200);
        await tagApi.Received().GetTopArtistsAsync("rock", 2, 200);
        await tagApi.Received().GetTopArtistsAsync("alternative", 1, 200);
        await tagApi.Received().GetTopArtistsAsync("alternative", 2, 200);
    }

    [Test]
    public async Task GetStationArtists_Returns_Empty_When_No_Intersection_Found()
    {
        var definition = new TagsStationDefinition(["rock", "jazz"]);

        var rockArtists = new[]
        {
            new LastArtist { Name = "Led Zeppelin" },
            new LastArtist { Name = "Deep Purple" }
        };

        var jazzArtists = new[]
        {
            new LastArtist { Name = "Miles Davis" },
            new LastArtist { Name = "John Coltrane" }
        };

        tagApi.GetTopArtistsAsync("rock", Arg.Any<int>(), Arg.Any<int>())
              .Returns(new PageResponse<LastArtist>(rockArtists));
        tagApi.GetTopArtistsAsync("jazz", Arg.Any<int>(), Arg.Any<int>())
              .Returns(new PageResponse<LastArtist>(jazzArtists));

        var result = await source.GetStationArtists(definition);

        Assert.That(result, Is.Empty);
    }
}