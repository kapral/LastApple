using System.Threading.Tasks;
using LastApple.PlaylistGeneration;
using LastfmApi;
using LastfmApi.Models;
using NSubstitute;
using NUnit.Framework;
using StationTrackGenerator = LastApple.PlaylistGeneration.StationTrackGenerator<LastApple.PlaylistGeneration.SimilarArtistsStationDefinition>;

namespace LastApple.Tests.StationGeneration
{
    public class TestStationTrackGenerator
    {
        private ILastfmApi lastfmApi;
        private IRandomizer randomizer;
        private ITrackRepository trackRepository;
        private IStationSource<SimilarArtistsStationDefinition> stationSource;

        private IStationTrackGenerator<SimilarArtistsStationDefinition> generator;

        [SetUp]
        public void Init()
        {
            lastfmApi       = Substitute.For<ILastfmApi>();
            randomizer      = Substitute.For<IRandomizer>();
            trackRepository = Substitute.For<ITrackRepository>();
            stationSource   = Substitute.For<IStationSource<SimilarArtistsStationDefinition>>();

            generator = new StationTrackGenerator(randomizer, lastfmApi, trackRepository, stationSource);
        }

        [Test]
        public void Constructor_Throws_On_Null_Arguments()
        {
            Assert.That(() => new StationTrackGenerator(null, lastfmApi, trackRepository, stationSource),
                Throws.ArgumentNullException);

            Assert.That(() => new StationTrackGenerator(randomizer, null, trackRepository, stationSource),
                Throws.ArgumentNullException);

            Assert.That(() => new StationTrackGenerator(randomizer, lastfmApi, null, stationSource),
                Throws.ArgumentNullException);

            Assert.That(() => new StationTrackGenerator(randomizer, lastfmApi, trackRepository, null),
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
            var artists = new[] {
                new Artist("Death In June"),
                new Artist("Rome"),
                new Artist("Darkwood")
            };
            var deathInJuneTracks = new[]
            {
                new Track("Little Black Angel", artists[0], 90),
                new Track("All Pigs Must Die", artists[0], 90),
                new Track("Fall Apart", artists[0], 90)
            };
            var darkwoodTracks = new[]
            {
                new Track("Caucasian Tales", artists[2], 100),
                new Track("Wintermärchen", artists[2], 100)
            };

            stationSource.GetStationArtists(station).Returns(artists);
            trackRepository.GetArtistTracks(artists[0]).Returns(deathInJuneTracks);
            trackRepository.GetArtistTracks(artists[2]).Returns(darkwoodTracks);
            randomizer.NextDecreasing(artists.Length).Returns(2, 0);
            randomizer.NextStandard(darkwoodTracks.Length).Returns(0);
            randomizer.NextStandard(deathInJuneTracks.Length).Returns(1);

            var track1Info = new TrackInfo("something", new Album("Ins Dunkle Land"), artists[2]);
            lastfmApi.GetTrackInfo(artists[2].Name, darkwoodTracks[0].Name)
                .Returns(track1Info);

            var track1 = await generator.GetNext(station);
            var track2 = await generator.GetNext(station);

            Assert.That(track1, Is.EqualTo(track1Info));

            Assert.That(track2.Name, Is.EqualTo(deathInJuneTracks[1].Name));
            Assert.That(track2.Artist, Is.EqualTo(artists[0]));
            Assert.That(track2.Album, Is.Null);
        }
    }
}