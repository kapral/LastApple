using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastApple.PlaylistGeneration;
using LastfmApi.Models;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests.StationGeneration
{
    public class TestLastfmCache
    {
        private IStationDataCache cache;

        [SetUp]
        public void Init()
        {
            cache = new StationDataCache();
        }

        [Test]
        public void GetArtistTracks_Throws_On_Null_Arguments()
        {
            Assert.That(() => cache.GetArtistTracks(null, Substitute.For<Func<Task<IEnumerable<Track>>>>()),
                Throws.ArgumentNullException);
            Assert.That(() => cache.GetArtistTracks(new Artist("Serdyuchka"), null),
                Throws.ArgumentNullException);
        }

        [Test]
        public async Task GetArtistTracks_Returns_Successful_Task_Result_And_Caches_It()
        {
            var tracks = new[]
            {
                new Track("Gop", new Artist("Serdyuchka"), 300)
            };

            var taskFactory = Substitute.For<Func<Task<IEnumerable<Track>>>>();
            taskFactory().Returns(Task.FromResult(tracks.AsEnumerable()));

            var result1 = await cache.GetArtistTracks(tracks[0].Artist, taskFactory);
            var result2 = await cache.GetArtistTracks(tracks[0].Artist, taskFactory);

            Assert.That(result1, Is.EqualTo(tracks));
            Assert.That(result2, Is.SameAs(result1));

            await taskFactory.Received(1)();
        }

        [Test]
        public async Task GetArtistTracks_Returns_Empty_Task_Result_And_Caches_It()
        {
            var artist = new Artist("Ictus");
            var taskFactory = Substitute.For<Func<Task<IEnumerable<Track>>>>();
            taskFactory().Returns(Task.FromResult(Enumerable.Empty<Track>()));

            var result1 = await cache.GetArtistTracks(artist, taskFactory);
            var result2 = await cache.GetArtistTracks(artist, taskFactory);

            Assert.That(result1, Is.Empty);
            Assert.That(result2, Is.Empty);

            await taskFactory.Received(1)();
        }

        [Test]
        public void GetArtistTracks_Returns_Same_Task_While_Its_Running()
        {
            var artist           = new Artist("Ictus");
            var taskFactory      = Substitute.For<Func<Task<IEnumerable<Track>>>>();
            var completionSource = new TaskCompletionSource<IEnumerable<Track>>();
            var task             = completionSource.Task;

            taskFactory().Returns(task);

            var task1 = cache.GetArtistTracks(artist, taskFactory);
            var task2 = cache.GetArtistTracks(artist, taskFactory);

            Assert.That(task1, Is.SameAs(task2));
            Assert.That(task1.Status, Is.EqualTo(TaskStatus.WaitingForActivation));

            taskFactory.Received(1)();
        }

        [Test]
        public async Task GetArtistTracks_Retries_If_Task_Fails()
        {
            var artist      = new Artist("Ictus");
            var taskFactory = Substitute.For<Func<Task<IEnumerable<Track>>>>();
            var tracks      = new[] { new Track("Imperivm", artist, 300) };

            SetupGetArtistTracksFailures(artist, taskFactory, 1);
            taskFactory().Returns(Task.FromResult(tracks.AsEnumerable()));

            var result = await cache.GetArtistTracks(artist, taskFactory);

            Assert.That(result, Is.EqualTo(tracks));

            await taskFactory.Received(2)();
        }

        [Test]
        public async Task GetArtistTracks_Retries_If_Task_Returns_Null()
        {
            var artist      = new Artist("Ictus");
            var taskFactory = Substitute.For<Func<Task<IEnumerable<Track>>>>();
            var tracks      = new[] { new Track("Imperivm", artist, 300) };

            await SetupGetArtistTracksNullResults(artist, taskFactory, 1);
            taskFactory().Returns(Task.FromResult(tracks.AsEnumerable()));

            var result = await cache.GetArtistTracks(artist, taskFactory);

            Assert.That(result, Is.EqualTo(tracks));

            await taskFactory.Received(2)();
        }

        [Test]
        public async Task GetArtistTracks_Caches_Empty_After_3_Failures()
        {
            var artist      = new Artist("Ictus");
            var taskFactory = Substitute.For<Func<Task<IEnumerable<Track>>>>();

            SetupGetArtistTracksFailures(artist, taskFactory, 3);

            var result = await cache.GetArtistTracks(artist, taskFactory);

            Assert.That(result, Is.Empty);

            await taskFactory.Received(3)();
        }

        [Test]
        public async Task GetArtistTracks_Caches_Empty_After_3_Nulls()
        {
            var artist      = new Artist("Ictus");
            var taskFactory = Substitute.For<Func<Task<IEnumerable<Track>>>>();

            await SetupGetArtistTracksNullResults(artist, taskFactory, 3);

            var result = await cache.GetArtistTracks(artist, taskFactory);

            Assert.That(result, Is.Empty);

            await taskFactory.Received(3)();
        }

        [Test]
        public void GetArtists_Throws_On_Null_Arguments()
        {
            Assert.That(() => cache.GetArtists(null, Substitute.For<Func<Task<IEnumerable<Artist>>>>()),
                Throws.ArgumentNullException);
            Assert.That(() => cache.GetArtists(new ArtistsStationDefinition(), null),
                Throws.ArgumentNullException);
        }

        [Test]
        public async Task Get_Artists_Loads_And_Caches_Station_Artists()
        {
            var artists = new[] { new Artist("Serdyuchka"), new Artist("Ictus") };
            var station = new SimilarArtistsStationDefinition("Kirkorow");

            var taskFactory = Substitute.For<Func<Task<IEnumerable<Artist>>>>();
            taskFactory().Returns(Task.FromResult(artists.AsEnumerable()));

            var result1 = await cache.GetArtists(station, taskFactory);
            var result2 = await cache.GetArtists(station, taskFactory);

            Assert.That(result1, Is.EqualTo(artists));
            Assert.That(result2, Is.EqualTo(artists));

            await taskFactory.Received(1)();
        }

        [Test]
        public async Task Get_Artists_Filters_Out_Ones_With_Null_Cached_Tracks_After_Retries()
        {
            var artists = new[] { new Artist("Serdyuchka"), new Artist("Ictus") };
            var station = new SimilarArtistsStationDefinition("Kirkorow");

            var artistsTaskFactory = Substitute.For<Func<Task<IEnumerable<Artist>>>>();
            var tracksTaskFactory  = Substitute.For<Func<Task<IEnumerable<Track>>>>();

            artistsTaskFactory().Returns(Task.FromResult(artists.AsEnumerable()));
            SetupGetArtistTracksFailures(artists[0], tracksTaskFactory, 3);

            var result = await cache.GetArtists(station, artistsTaskFactory);

            Assert.That(result, Is.EqualTo(artists.Skip(1)));
        }

        [Test]
        public async Task Get_Artists_Filters_Out_Ones_With_Cached_Empty_Tracks()
        {
            var artists = new[] { new Artist("Serdyuchka"), new Artist("Ictus") };
            var station = new SimilarArtistsStationDefinition("Kirkorow");

            var artistsTaskFactory = Substitute.For<Func<Task<IEnumerable<Artist>>>>();
            var tracksTaskFactory  = Substitute.For<Func<Task<IEnumerable<Track>>>>();

            tracksTaskFactory().Returns(Task.FromResult(Enumerable.Empty<Track>()));
            artistsTaskFactory().Returns(Task.FromResult(artists.AsEnumerable()));

            await cache.GetArtistTracks(artists[0], tracksTaskFactory);
            var result = await cache.GetArtists(station, artistsTaskFactory);

            Assert.That(result, Is.EqualTo(artists.Skip(1)));
        }

        [Test]
        public async Task Get_Artists_Returns_Ones_Which_Have_Retries_Left()
        {
            var artists = new[] { new Artist("Serdyuchka"), new Artist("Ictus") };
            var station = new SimilarArtistsStationDefinition("Kirkorow");

            var artistsTaskFactory = Substitute.For<Func<Task<IEnumerable<Artist>>>>();
            var tracksTaskFactory  = Substitute.For<Func<Task<IEnumerable<Track>>>>();

            artistsTaskFactory().Returns(Task.FromResult(artists.AsEnumerable()));
            SetupGetArtistTracksFailures(artists[0], tracksTaskFactory, 2);

            var result = await cache.GetArtists(station, artistsTaskFactory);

            Assert.That(result, Is.EqualTo(artists));
        }

        private void SetupGetArtistTracksFailures(Artist artist, Func<Task<IEnumerable<Track>>> taskFactory, int times)
        {
            for (var i = 0; i < times; i++)
            {
                var completionSource = new TaskCompletionSource<IEnumerable<Track>>();
                completionSource.SetException(new Exception());
                taskFactory().Returns(completionSource.Task);

                Assert.That(() => cache.GetArtistTracks(artist, taskFactory), Throws.Exception);
            }
        }

        private async Task SetupGetArtistTracksNullResults(Artist artist, Func<Task<IEnumerable<Track>>> taskFactory, int times)
        {
            for (var i = 0; i < times; i++)
            {
                var completionSource = new TaskCompletionSource<IEnumerable<Track>>();
                completionSource.SetResult(null);
                taskFactory().Returns(completionSource.Task);

                Assert.That(await cache.GetArtistTracks(artist, taskFactory), Is.Empty);
            }
        }
    }
}