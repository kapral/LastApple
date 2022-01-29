using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using NSubstitute;
using NUnit.Framework;
using StationTrackGenerator = LastApple.PlaylistGeneration.StationTrackGenerator<LastApple.PlaylistGeneration.SimilarArtistsStationDefinition>;

namespace LastApple.Tests.StationGeneration
{
    public class TestStationTrackGenerator
    {
        private IRandomizer randomizer;
        private ITrackRepository trackRepository;
        private IStationSource<SimilarArtistsStationDefinition> stationSource;

        private IStationTrackGenerator<SimilarArtistsStationDefinition> generator;

        [SetUp]
        public void Init()
        {
            randomizer      = Substitute.For<IRandomizer>();
            trackRepository = Substitute.For<ITrackRepository>();
            stationSource   = Substitute.For<IStationSource<SimilarArtistsStationDefinition>>();

            generator = new StationTrackGenerator(randomizer, trackRepository, stationSource);
        }

        [Test]
        public void Constructor_Throws_On_Null_Arguments()
        {
            Assert.That(() => new StationTrackGenerator(null, trackRepository, stationSource),
                Throws.ArgumentNullException);

            Assert.That(() => new StationTrackGenerator(randomizer, null, stationSource),
                Throws.ArgumentNullException);

            Assert.That(() => new StationTrackGenerator(randomizer, trackRepository, null),
                Throws.ArgumentNullException);
        }

        [Test]
        public void GetNext_Throws_On_Null_Parameters()
        {
            Assert.That(() => generator.GetNext(null), Throws.ArgumentNullException);
        }

        [Test]
        public async Task GetNext_Picks_Random_Artists_And_Track()
        {
            var station = new SimilarArtistsStationDefinition("Death In June");
            var artists = new[]
            {
                new Artist { Name = "Death In June" },
                new Artist { Name = "Rome" },
                new Artist { Name = "Darkwood" }
            };
            var deathInJuneTracks = new[]
            {
                new Track { Name = "Little Black Angel", ArtistName = artists[0].Name },
                new Track { Name = "All Pigs Must Die", ArtistName = artists[0].Name },
                new Track { Name = "Fall Apart", ArtistName = artists[0].Name }
            };
            var darkwoodTracks = new[]
            {
                new Track { Name = "Caucasian Tales", ArtistName = artists[2].Name },
                new Track { Name = "Wintermärchen", ArtistName   = artists[2].Name }
            };

            stationSource.GetStationArtists(station).Returns(artists);
            trackRepository.GetArtistTracks(artists[0]).Returns(deathInJuneTracks);
            trackRepository.GetArtistTracks(artists[2]).Returns(darkwoodTracks);
            randomizer.NextDecreasing(artists.Length).Returns(2, 0);
            randomizer.NextStandard(darkwoodTracks.Length).Returns(0);
            randomizer.NextStandard(deathInJuneTracks.Length).Returns(1);

            var track1 = await generator.GetNext(station);
            var track2 = await generator.GetNext(station);

            Assert.That(track1, Is.EqualTo(darkwoodTracks[0]));
            Assert.That(track2, Is.EqualTo(deathInJuneTracks[1]));
        }
    }
}