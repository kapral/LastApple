using System.Linq;
using System.Threading.Tasks;
using LastApple.PlaylistGeneration;
using LastfmApi;
using LastfmApi.Models;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration
{
    public class TestSimilarArtistsStationSource
    {
        private ILastfmApi lastfmApi;

        private IStationSource<SimilarArtistsStationDefinition> source;

        [SetUp]
        public void Init()
        {
            lastfmApi = Substitute.For<ILastfmApi>();

            source = new SimilarArtistsStationSource(lastfmApi);
        }

        [Test]
        public void Constructor_Throws_On_Null_Arguments()
        {
            Assert.That(() => new SimilarArtistsStationSource(null), Throws.ArgumentNullException);
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
            var similar    = new[] { new Artist("Rome"), new Artist("Sol Invictus"), };

            lastfmApi.GetSimilarArtists(definition.SourceArtist).Returns(Task.FromResult(similar.AsEnumerable()));

            var result = await source.GetStationArtists(definition);

            Assert.That(result, Is.EqualTo(new[] { new Artist(definition.SourceArtist), similar[0], similar[1] }));
        }
    }
}