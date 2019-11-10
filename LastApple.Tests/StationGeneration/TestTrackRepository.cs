using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastApple.PlaylistGeneration;
using LastfmApi;
using LastfmApi.Models;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration
{
    public class TestTrackRepository
    {
        private ILastfmApi lastfmApi;

        private ITrackRepository repository;

        [SetUp]
        public void Init()
        {
            lastfmApi = Substitute.For<ILastfmApi>();

            repository = new TrackRepository(lastfmApi);
        }

        [Test]
        public void Constructor_Throws_On_Null_Arguments()
        {
            Assert.That(() => new TrackRepository(null), Throws.ArgumentNullException);
        }

        [Test]
        public void GetArtistTracks_Throws_On_Null_Arguments()
        {
            Assert.That(() => repository.GetArtistTracks(null), Throws.ArgumentNullException);
        }

        [Test]
        public async Task GetArtistTracks_Returns_Successful_Task_Result_And_Caches_It()
        {
            const string artist = "Serdyuchka";
            var tracks = new[]
            {
                new Track("Gop", new Artist(artist), 300)
            };

            lastfmApi.GetTopTracks(artist).Returns(tracks.AsEnumerable());

            var result1 = await repository.GetArtistTracks(tracks[0].Artist);
            var result2 = await repository.GetArtistTracks(tracks[0].Artist);

            Assert.That(result1, Is.EqualTo(tracks));
            Assert.That(result2, Is.SameAs(result1));

            await lastfmApi.Received(1).GetTopTracks(artist);
        }

        [Test]
        public async Task GetArtistTracks_Returns_Empty_Task_Result_And_Caches_It()
        {
            var artist = new Artist("Ictus");
            lastfmApi.GetTopTracks(artist.Name)
                .Returns(Task.FromResult(Enumerable.Empty<Track>()));

            var result1 = await repository.GetArtistTracks(artist);
            var result2 = await repository.GetArtistTracks(artist);

            Assert.That(result1, Is.Empty);
            Assert.That(result2, Is.Empty);

            await lastfmApi.Received(1).GetTopTracks(artist.Name);
        }

        [Test]
        public void GetArtistTracks_Returns_Same_Task_While_Its_Running()
        {
            var artist           = new Artist("Ictus");
            var completionSource = new TaskCompletionSource<IEnumerable<Track>>();
            var task             = completionSource.Task;

            lastfmApi.GetTopTracks(artist.Name).Returns(task);

            var task1 = repository.GetArtistTracks(artist);
            var task2 = repository.GetArtistTracks(artist);

            Assert.That(task1, Is.SameAs(task2));
            Assert.That(task1.Status, Is.EqualTo(TaskStatus.WaitingForActivation));

            lastfmApi.Received(1).GetTopTracks(artist.Name);
        }

        [Test]
        public async Task GetArtistTracks_Retries_If_Task_Fails()
        {
            var artist = new Artist("Ictus");
            var tracks = new[] { new Track("Imperivm", artist, 300) };

            SetupGetArtistTracksFailures(artist, 1);
            lastfmApi.GetTopTracks(artist.Name).Returns(tracks.AsEnumerable());

            var result = await repository.GetArtistTracks(artist);

            Assert.That(result, Is.EqualTo(tracks));

            await lastfmApi.Received(2).GetTopTracks(artist.Name);
        }

        [Test]
        public async Task GetArtistTracks_Retries_If_Task_Returns_Null()
        {
            var artist = new Artist("Ictus");
            var tracks = new[] { new Track("Imperivm", artist, 300) };

            await SetupGetArtistTracksNullResults(artist, 1);
            lastfmApi.GetTopTracks(artist.Name)
                .Returns(Task.FromResult(tracks.AsEnumerable()));

            var result = await repository.GetArtistTracks(artist);

            Assert.That(result, Is.EqualTo(tracks));

            await lastfmApi.Received(2).GetTopTracks(artist.Name);
        }

        [Test]
        public async Task GetArtistTracks_Caches_Empty_After_3_Failures()
        {
            var artist = new Artist("Ictus");

            SetupGetArtistTracksFailures(artist, 3);

            var result = await repository.GetArtistTracks(artist);

            Assert.That(result, Is.Empty);

            await lastfmApi.Received(3).GetTopTracks(artist.Name);
        }

        [Test]
        public async Task GetArtistTracks_Caches_Empty_After_3_Nulls()
        {
            var artist = new Artist("Ictus");

            await SetupGetArtistTracksNullResults(artist, 3);

            var result = await repository.GetArtistTracks(artist);

            Assert.That(result, Is.Empty);

            await lastfmApi.Received(3).GetTopTracks(artist.Name);
        }

        [Test]
        public void ArtistHasTracks_Returns_True_For_Artists_Not_Requested_Yet()
        {
            var artist = new Artist("Serdyuchka");

            Assert.That(repository.ArtistHasTracks(artist));
        }

        [Test]
        public void ArtistHasTracks_Returns_True_For_Artists_Which_Has_Retries_Left()
        {
            var artist = new Artist("Serdyuchka");

            SetupGetArtistTracksFailures(artist, 2);

            Assert.That(repository.ArtistHasTracks(artist));
        }

        [Test]
        public async Task ArtistHasTracks_Returns_False_For_Artists_With_Cached_Empty_Tracks()
        {
            var artist = new Artist("Serdyuchka");

            lastfmApi.GetTopTracks(artist.Name).Returns(Enumerable.Empty<Track>());

            await repository.GetArtistTracks(artist);
            var result = repository.ArtistHasTracks(artist);

            Assert.That(result, Is.False);
        }

        [Test]
        public void ArtistHasTracks_Returns_False_For_Artists_With_3_Failures()
        {
            var artist = new Artist("Serdyuchka");

            SetupGetArtistTracksFailures(artist, 3);

            Assert.That(repository.ArtistHasTracks(artist), Is.False);
        }

        [Test]
        public async Task ArtistHasTracks_Returns_False_For_Artists_With_3_Nulls()
        {
            var artist = new Artist("Serdyuchka");

            await SetupGetArtistTracksNullResults(artist, 3);

            Assert.That(repository.ArtistHasTracks(artist), Is.False);
        }

        private void SetupGetArtistTracksFailures(Artist artist, int times)
        {
            for (var i = 0; i < times; i++)
            {
                lastfmApi.GetTopTracks(artist.Name)
                    .Returns(Task.FromException<IEnumerable<Track>>(new Exception()));

                Assert.That(() => repository.GetArtistTracks(artist), Throws.Exception);
            }
        }

        private async Task SetupGetArtistTracksNullResults(Artist artist, int times)
        {
            for (var i = 0; i < times; i++)
            {
                lastfmApi.GetTopTracks(artist.Name)
                    .Returns(Task.FromResult<IEnumerable<Track>>(null));

                Assert.That(await repository.GetArtistTracks(artist), Is.Empty);
            }
        }
    }
}