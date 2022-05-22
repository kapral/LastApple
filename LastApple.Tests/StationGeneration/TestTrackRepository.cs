using System;
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

public class TestTrackRepository
{
    private IArtistApi artistApi;

    private ITrackRepository repository;

    [SetUp]
    public void Init()
    {
        artistApi = Substitute.For<IArtistApi>();

        repository = new TrackRepository(artistApi);
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
        var artist     = new Artist(Name: "Serdyuchka");
        var tracks     = new[] { new Track(Name: "Gop", ArtistName: artist.Name) };
        var lastTracks = new[] { new LastTrack { Name = "Gop", ArtistName = artist.Name } };

        artistApi.GetTopTracksAsync(artist.Name).Returns(PageResponse<LastTrack>.CreateSuccessResponse(lastTracks));

        var result1 = await repository.GetArtistTracks(artist);
        var result2 = await repository.GetArtistTracks(artist);

        Assert.That(result1, Is.EqualTo(tracks));
        Assert.That(result2, Is.SameAs(result1));

        await artistApi.Received(1).GetTopTracksAsync(artist.Name);
    }

    [Test]
    public async Task GetArtistTracks_Returns_Empty_Task_Result_And_Caches_It()
    {
        var artist = new Artist(Name: "Ictus");
        artistApi.GetTopTracksAsync(artist.Name)
                 .Returns(PageResponse<LastTrack>.CreateSuccessResponse());

        var result1 = await repository.GetArtistTracks(artist);
        var result2 = await repository.GetArtistTracks(artist);

        Assert.That(result1, Is.Empty);
        Assert.That(result2, Is.Empty);

        await artistApi.Received(1).GetTopTracksAsync(artist.Name);
    }

    [Test]
    public void GetArtistTracks_Returns_Same_Task_While_Its_Running()
    {
        var artist           = new Artist(Name: "Ictus");
        var completionSource = new TaskCompletionSource<PageResponse<LastTrack>>();
        var task             = completionSource.Task;

        artistApi.GetTopTracksAsync(artist.Name).Returns(task);

        var task1 = repository.GetArtistTracks(artist);
        var task2 = repository.GetArtistTracks(artist);

        Assert.That(task1, Is.SameAs(task2));
        Assert.That(task1.Status, Is.EqualTo(TaskStatus.WaitingForActivation));

        artistApi.Received(1).GetTopTracksAsync(artist.Name);
    }

    [Test]
    public async Task GetArtistTracks_Retries_If_Task_Fails()
    {
        var artist     = new Artist(Name: "Ictus");
        var tracks     = new[] { new Track(Name: "Imperivm", ArtistName: artist.Name) };
        var lastTracks = new[] { new LastTrack { Name = "Imperivm", ArtistName = artist.Name } };

        await SetupGetArtistTracksFailures(artist, 1);
        artistApi.GetTopTracksAsync(artist.Name).Returns(PageResponse<LastTrack>.CreateSuccessResponse(lastTracks));

        var result = await repository.GetArtistTracks(artist);

        Assert.That(result, Is.EqualTo(tracks));

        await artistApi.Received(2).GetTopTracksAsync(artist.Name);
    }

    [Test]
    public async Task GetArtistTracks_Retries_If_Task_Returns_Unsuccessful()
    {
        var artist     = new Artist(Name: "Ictus");
        var lastTracks = new[] { new LastTrack { Name = "Imperivm", ArtistName = artist.Name} };
        var tracks     = new[] { new Track(Name: "Imperivm", ArtistName: artist.Name) };

        await SetupGetArtistTracksUnsuccessfulResults(artist, 1);
        artistApi.GetTopTracksAsync(artist.Name)
                 .Returns(PageResponse<LastTrack>.CreateSuccessResponse(lastTracks));

        var result = await repository.GetArtistTracks(artist);

        Assert.That(result, Is.EqualTo(tracks));

        await artistApi.Received(2).GetTopTracksAsync(artist.Name);
    }

    [Test]
    public async Task GetArtistTracks_Caches_Empty_After_3_Failures()
    {
        var artist = new Artist(Name: "Ictus");

        await SetupGetArtistTracksFailures(artist, 3);

        var result = await repository.GetArtistTracks(artist);

        Assert.That(result, Is.Empty);

        await artistApi.Received(3).GetTopTracksAsync(artist.Name);
    }

    [Test]
    public async Task GetArtistTracks_Caches_Empty_After_3_Unsuccessful_Responses()
    {
        var artist = new Artist(Name: "Ictus");

        await SetupGetArtistTracksUnsuccessfulResults(artist, 3);

        var result = await repository.GetArtistTracks(artist);

        Assert.That(result, Is.Empty);

        await artistApi.Received(3).GetTopTracksAsync(artist.Name);
    }

    [Test]
    public void ArtistHasTracks_Returns_True_For_Artists_Not_Requested_Yet()
    {
        var artist = new Artist(Name: "Serdyuchka");

        Assert.That(repository.ArtistHasTracks(artist));
    }

    [Test]
    public async Task ArtistHasTracks_Returns_True_For_Artists_Which_Has_Retries_Left()
    {
        var artist = new Artist(Name: "Serdyuchka");

        await SetupGetArtistTracksFailures(artist, 2);

        Assert.That(repository.ArtistHasTracks(artist));
    }

    [Test]
    public async Task ArtistHasTracks_Returns_False_For_Artists_With_Cached_Empty_Tracks()
    {
        var artist = new Artist(Name: "Serdyuchka");

        artistApi.GetTopTracksAsync(artist.Name).Returns(PageResponse<LastTrack>.CreateSuccessResponse());

        await repository.GetArtistTracks(artist);
        var result = repository.ArtistHasTracks(artist);

        Assert.That(result, Is.False);
    }

    [Test]
    public async Task ArtistHasTracks_Returns_False_For_Artists_With_3_Failures()
    {
        var artist = new Artist(Name: "Serdyuchka");

        await SetupGetArtistTracksFailures(artist, 3);

        Assert.That(repository.ArtistHasTracks(artist), Is.False);
    }

    [Test]
    public async Task ArtistHasTracks_Returns_False_For_Artists_With_3_Unsuccessful()
    {
        var artist = new Artist(Name: "Serdyuchka");

        await SetupGetArtistTracksUnsuccessfulResults(artist, 3);

        Assert.That(repository.ArtistHasTracks(artist), Is.False);
    }

    private async Task SetupGetArtistTracksFailures(Artist artist, int times)
    {
        for (var i = 0; i < times; i++)
        {
            artistApi.GetTopTracksAsync(artist.Name)
                     .Returns(Task.FromException<PageResponse<LastTrack>>(new Exception()));

            Assert.That(await repository.GetArtistTracks(artist), Is.Empty);
        }
    }

    private async Task SetupGetArtistTracksUnsuccessfulResults(Artist artist, int times)
    {
        for (var i = 0; i < times; i++)
        {
            artistApi.GetTopTracksAsync(artist.Name)
                     .Returns(PageResponse<LastTrack>.CreateErrorResponse(LastResponseStatus.Failure));

            Assert.That(await repository.GetArtistTracks(artist), Is.Empty);
        }
    }
}