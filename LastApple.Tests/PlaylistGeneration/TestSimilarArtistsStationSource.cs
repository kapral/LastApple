using System.Collections.Generic;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration;

public class TestSimilarArtistsStationSource
{
    private IArtistApi artistApi;

    private IStationSource<SimilarArtistsStationDefinition> source;

    [SetUp]
    public void Init()
    {
        artistApi = Substitute.For<IArtistApi>();

        source = new SimilarArtistsStationSource(artistApi);
    }

    [Test]
    public void GetStationArtists_Throws_On_Null_Parameters()
    {
        Assert.That(() => source.GetStationArtists(null), Throws.ArgumentNullException);
    }

    [Test]
    public async Task GetStationArtists_Returns_Source_Artist_And_Similar_From_Api()
    {
        var definition = new SimilarArtistsStationDefinition("Death In June");
        var similar    = new[] { new LastArtist { Name = "Rome" }, new LastArtist { Name = "Sol Invictus" } };

        artistApi.GetSimilarAsync(definition.SourceArtist).Returns(new PageResponse<LastArtist>(similar));

        var result = await source.GetStationArtists(definition);

        var expectedArtists = new[]
        {
            new Artist(Name: definition.SourceArtist),
            new Artist(Name: similar[0].Name),
            new Artist(Name: similar[1].Name)
        };
        Assert.That(result, Is.EqualTo(expectedArtists));
    }
}