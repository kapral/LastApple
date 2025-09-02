using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Enums;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration;

public class TestLastfmLibraryStationSource
{
    private IUserApi userApi;

    private IStationSource<LastfmLibraryStationDefinition> source;

    [SetUp]
    public void Init()
    {
        userApi = Substitute.For<IUserApi>();

        source = new LastfmLibraryStationSource(userApi);
    }

    [Test]
    public void GetStationArtists_Throws_On_Null_Arguments()
    {
        Assert.That(() => source.GetStationArtists(null), Throws.ArgumentNullException);
    }

    [Test]
    public async Task GetStationArtists_Returns_Users_Top_Artists_From_Api()
    {
        var definition = new LastfmLibraryStationDefinition(User: "Listener", Period: "12month");
        var artists    = new[] { new LastArtist { Name = "Asaf Avidan" } };

        userApi.GetTopArtists(definition.User, pagenumber: 1, count: 100, span: LastStatsTimeSpan.Year)
               .Returns(new PageResponse<LastArtist>(artists));

        var result = await source.GetStationArtists(definition);

        Assert.That(result, Is.EqualTo([new Artist(Name: "Asaf Avidan")]));
    }
}