using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration;

public class TestArtistStationSource
{
    private IStationSource<ArtistsStationDefinition> source;

    [SetUp]
    public void Init()
    {
        source = new ArtistsStationSource();
    }

    [Test]
    public void GetStationArtists_Throws_On_Null_Arguments()
    {
        Assert.That(() => source.GetStationArtists(null), Throws.ArgumentNullException);
    }

    [Test]
    public async Task GetStationArtists_Returns_Artists_From_Definition()
    {
        var definition = new ArtistsStationDefinition
        {
            Artists = { "Reka", "Ictus" }
        };

        var artists = await source.GetStationArtists(definition);

        var expectedArtists = new[] { new Artist { Name = "Reka" }, new Artist { Name = "Ictus" } };

        Assert.That(artists, Is.EqualTo(expectedArtists));
    }
}