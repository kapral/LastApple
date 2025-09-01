using LastApple.Model;
using LastApple.PlaylistGeneration;

namespace LastApple.Web.Tests;

public class TestSimilarArtistsStationController
{
    private IStationRepository mockStationRepository;
    private IStationGenerator<SimilarArtistsStationDefinition> mockStationGenerator;
    private IBackgroundProcessManager mockBackgroundProcessManager;
    private IStorefrontProvider mockStorefrontProvider;
    private SimilarArtistsStationController controller;

    [SetUp]
    public void Setup()
    {
        mockStationRepository = Substitute.For<IStationRepository>();
        mockStationGenerator = Substitute.For<IStationGenerator<SimilarArtistsStationDefinition>>();
        mockBackgroundProcessManager = Substitute.For<IBackgroundProcessManager>();
        mockStorefrontProvider = Substitute.For<IStorefrontProvider>();

        controller = new SimilarArtistsStationController(
            mockStationRepository,
            mockStationGenerator,
            mockBackgroundProcessManager,
            mockStorefrontProvider);
    }

    [Test]
    public void Create_Throws_For_Null_Artist()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Create(null));
    }

    [Test]
    public void Create_Throws_For_Empty_Artist()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Create(""));
    }

    [Test]
    public void Create_Throws_For_Whitespace_Artist()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await controller.Create("   "));
    }

    [Test]
    public async Task Create_Creates_Station_For_Valid_Artist()
    {
        var artist = "The Beatles";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var station = await controller.Create(artist);

        Assert.That(station, Is.Not.Null);
        Assert.That(station.IsContinuous, Is.True);
        Assert.That(station.Definition.SourceArtist, Is.EqualTo(artist));
        Assert.That(station.Id, Is.Not.EqualTo(Guid.Empty));

        mockStationRepository.Received(1).Create(Arg.Any<Station<SimilarArtistsStationDefinition>>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task Create_Calls_StationGenerator_With_Correct_Parameters()
    {
        var artist = "Radiohead";
        var storefront = "uk";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        await controller.Create(artist);

        await mockStorefrontProvider.Received(1).GetStorefront();
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task TopUp_Returns_NotFound_For_Invalid_Station_Id()
    {
        var stationId = Guid.NewGuid();
        var count = 10;

        mockStationRepository.Get(stationId).Returns((StationBase)null);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task TopUp_Returns_NotFound_For_Wrong_Station_Type()
    {
        var stationId = Guid.NewGuid();
        var count = 10;
        var wrongTypeStation = Substitute.For<StationBase>();

        mockStationRepository.Get(stationId).Returns(wrongTypeStation);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task TopUp_Adds_TopUp_Process_For_Valid_Station()
    {
        var stationId = Guid.NewGuid();
        var count = 15;
        var definition = new SimilarArtistsStationDefinition("The Beatles");
        var station = new Station<SimilarArtistsStationDefinition>(definition) { Id = stationId };
        var storefront = "us";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task TopUp_Calls_StationGenerator_TopUp()
    {
        var stationId = Guid.NewGuid();
        var count = 20;
        var definition = new SimilarArtistsStationDefinition("Pink Floyd");
        var station = new Station<SimilarArtistsStationDefinition>(definition) { Id = stationId };
        var storefront = "ca";

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns(storefront);

        await controller.TopUp(stationId, count);

        await mockStorefrontProvider.Received(1).GetStorefront();
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }

    [Test]
    public async Task Create_Sets_Station_Properties_Correctly()
    {
        var artist = "Led Zeppelin";
        var storefront = "us";

        mockStorefrontProvider.GetStorefront().Returns(storefront);

        var station = await controller.Create(artist);

        Assert.That(station.Definition.SourceArtist, Is.EqualTo(artist));
        Assert.That(station.IsContinuous, Is.True);
        Assert.That(station.Id, Is.Not.EqualTo(Guid.Empty));
    }

    [Test]
    public async Task TopUp_With_Zero_Count_Still_Processes()
    {
        var stationId = Guid.NewGuid();
        var count = 0;
        var definition = new SimilarArtistsStationDefinition("Queen");
        var station = new Station<SimilarArtistsStationDefinition>(definition) { Id = stationId };

        mockStationRepository.Get(stationId).Returns(station);
        mockStorefrontProvider.GetStorefront().Returns("us");

        var result = await controller.TopUp(stationId, count);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        mockBackgroundProcessManager.Received(1).AddProcess(Arg.Any<Func<Task>>());
    }
}