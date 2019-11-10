using System.Linq;
using System.Threading.Tasks;
using LastApple.PlaylistGeneration;
using LastfmApi;
using LastfmApi.Models;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration
{
    public class TestLastfmLibraryStationSource
    {
        private ILastfmApi lastfmApi;

        private IStationSource<LastfmLibraryStationDefinition> source;

        [SetUp]
        public void Init()
        {
            lastfmApi = Substitute.For<ILastfmApi>();

            source = new LastfmLibraryStationSource(lastfmApi);
        }

        [Test]
        public void Constructor_Throws_On_Null_Parameters()
        {
            Assert.That(() => new LastfmLibraryStationSource(null), Throws.ArgumentNullException);
        }

        [Test]
        public void GetStationArtists_Throws_On_Null_Arguments()
        {
            Assert.That(() => source.GetStationArtists(null), Throws.ArgumentNullException);
        }

        [Test]
        public async Task GetStationArtists_Returns_Users_Top_Artists_From_Api()
        {
            var definition = new LastfmLibraryStationDefinition
            {
                User = "Listener",
                Period = "year"
            };
            var artists = new[] { new Artist("") };

            lastfmApi.GetUserArtists(definition.User, limit: 100, period: definition.Period)
                .Returns(Task.FromResult(artists.AsEnumerable()));

            var result = await source.GetStationArtists(definition);

            Assert.That(result, Is.EqualTo(artists));
        }
    }
}