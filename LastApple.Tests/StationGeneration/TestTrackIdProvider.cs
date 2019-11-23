using System.Threading.Tasks;
using AppleMusicApi;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration
{
    public class TestTrackIdProvider
    {
        private ICatalogApi catalogApi;
        private IStorefrontProvider storefrontProvider;

        private ITrackIdProvider trackIdProvider;

        [SetUp]
        public void Init()
        {
            catalogApi = Substitute.For<ICatalogApi>();
            storefrontProvider = Substitute.For<IStorefrontProvider>();
            
            trackIdProvider = new TrackIdProvider(catalogApi, storefrontProvider);
        }

        [Test]
        public void Constructor_Throws_On_Null_Arguments()
        {
            Assert.That(() => new TrackIdProvider(null, storefrontProvider), Throws.ArgumentNullException);
            Assert.That(() => new TrackIdProvider(catalogApi, null), Throws.ArgumentNullException);
        }

        [Test]
        public async Task FindTrackId_Returns_First_Found_Track()
        {
            storefrontProvider.GetStorefront().Returns("ua");

            const string artist = "Shortparis";
            const string track  = "Amsterdam";

            var song = new Resource<SongAttributes> { Id = "song-123" };

            catalogApi.Search(Arg.Is<SearchParams>(x =>
                        x.Term.Equals($"{artist} - {track}") && x.Types == ResourceType.Songs && x.Limit == 1),
                    "ua")
                .Returns(new SearchResult
                {
                    Songs = new ResourceMatches<SongAttributes>
                    {
                        Data = { song }
                    }
                });

            var id = await trackIdProvider.FindTrackId(artist, track);

            Assert.That(id, Is.EqualTo(song.Id));
        }
        
        [Test]
        public async Task FindTrackId_Returns_Null_If_Not_Found()
        {
            storefrontProvider.GetStorefront().Returns("ua");

            const string artist = "Shortparis";
            const string track  = "Amsterdam";

            catalogApi.Search(Arg.Is<SearchParams>(x =>
                        x.Term.Equals($"{artist} - {track}") && x.Types == ResourceType.Songs && x.Limit == 1),
                    "ua")
                .Returns(new SearchResult { Songs = new ResourceMatches<SongAttributes>() });

            var id = await trackIdProvider.FindTrackId(artist, track);

            Assert.That(id, Is.Null);
        }
        
        [Test]
        public async Task FindTrackId_Returns_Null_If_Songs_Property_Is_Null()
        {
            storefrontProvider.GetStorefront().Returns("ua");

            const string artist = "Shortparis";
            const string track  = "Amsterdam";

            catalogApi.Search(Arg.Is<SearchParams>(x =>
                        x.Term.Equals($"{artist} - {track}") && x.Types == ResourceType.Songs && x.Limit == 1),
                    "ua")
                .Returns(new SearchResult { Songs = null });

            var id = await trackIdProvider.FindTrackId(artist, track);

            Assert.That(id, Is.Null);
        }
    }
}