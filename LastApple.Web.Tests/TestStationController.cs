using System.Collections.Generic;
using LastApple.Model;
using LastApple.Web.Exceptions;

namespace LastApple.Web.Tests;

public class TestStationController
{
    private IStationRepository mockStationRepository;
    private StationController controller;

    [SetUp]
    public void Setup()
    {
        mockStationRepository = Substitute.For<IStationRepository>();
        controller            = new StationController(mockStationRepository);
    }

    [Test]
    public void Get_Returns_JsonResult_With_Station_Data()
    {
        var stationId = Guid.NewGuid();
        var station = CreateTestStation(stationId, ["song1", "song2"]);
        mockStationRepository.Get(stationId).Returns(station);

        var result = controller.Get(stationId);

        Assert.That(result, Is.EqualTo(station));
    }

    [Test]
    public void DeleteSongs_Throws_NotFoundException_When_Station_Null()
    {
        var stationId = Guid.NewGuid();
        mockStationRepository.Get(stationId).Returns((StationBase)null);

        var exception = Assert.Throws<NotFoundException>(() => controller.DeleteSongs(stationId, 0, 1));
        Assert.That(exception, Is.Not.Null);
    }

    [Test]
    public void DeleteSongs_Throws_NotFoundException_When_Not_Enough_Songs()
    {
        var stationId = Guid.NewGuid();
        var station   = CreateTestStation(stationId, ["song1", "song2"]); // Only 2 songs
        mockStationRepository.Get(stationId).Returns(station);

        var exception = Assert.Throws<NotFoundException>(() => controller.DeleteSongs(stationId, 0, 3));
        Assert.That(exception, Is.Not.Null);
    }

    [Test]
    public void DeleteSongs_Throws_NotFoundException_When_Position_Out_Of_Range()
    {
        var stationId = Guid.NewGuid();
        var station = CreateTestStation(stationId, ["song1", "song2"]);
        mockStationRepository.Get(stationId).Returns(station);

        var exception = Assert.Throws<NotFoundException>(() => controller.DeleteSongs(stationId, 2, 1));
        Assert.That(exception, Is.Not.Null);
    }

    [Test]
    public void DeleteSongs_Removes_Songs_And_Returns_NoContent()
    {
        var stationId = Guid.NewGuid();
        var songIds = new List<string> { "song1", "song2", "song3", "song4" };
        var station = CreateTestStation(stationId, songIds);
        mockStationRepository.Get(stationId).Returns(station);

        Assert.DoesNotThrow(() => controller.DeleteSongs(stationId, 1, 2));
        Assert.That(station.SongIds, Has.Count.EqualTo(2));
        Assert.That(station.SongIds[0], Is.EqualTo("song1")); // First song remains
        Assert.That(station.SongIds[1], Is.EqualTo("song4")); // Last song moved down
    }

    [Test]
    public void DeleteSongs_Removes_Single_Song_Correctly()
    {
        var stationId = Guid.NewGuid();
        var songIds = new List<string> { "song1", "song2", "song3" };
        var station = CreateTestStation(stationId, songIds);
        mockStationRepository.Get(stationId).Returns(station);

        Assert.DoesNotThrow(() => controller.DeleteSongs(stationId, 1, 1));
        Assert.That(station.SongIds, Has.Count.EqualTo(2));
        Assert.That(station.SongIds[0], Is.EqualTo("song1"));
        Assert.That(station.SongIds[1], Is.EqualTo("song3"));
    }

    private TestStationBase CreateTestStation(Guid id, List<string> songIds)
    {
        var station = new TestStationBase(id);
        foreach (var songId in songIds)
        {
            station.SongIds.Add(songId);
        }
        return station;
    }

    // Helper record for testing since StationBase is abstract
    private record TestStationBase : StationBase
    {
        public TestStationBase(Guid id)
        {
            Id = id;
        }
    }
}