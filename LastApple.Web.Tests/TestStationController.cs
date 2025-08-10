using System;
using System.Collections.Generic;
using LastApple;
using LastApple.Model;
using LastApple.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestStationController
{
    private IStationRepository mockStationRepository;
    private StationController controller;

    [SetUp]
    public void Setup()
    {
        mockStationRepository = Substitute.For<IStationRepository>();
        controller = new StationController(mockStationRepository);
    }

    [Test]
    public void Constructor_Throws_On_Null_Repository()
    {
        Assert.That(() => new StationController(null!), 
            Throws.ArgumentNullException.With.Property("ParamName").EqualTo("stationRepository"));
    }

    [Test]
    public void Get_Returns_JsonResult_With_Station_Data()
    {
        // Arrange
        var stationId = Guid.NewGuid();
        var station = CreateTestStation(stationId, new List<string> { "song1", "song2" });
        mockStationRepository.Get(stationId).Returns(station);

        // Act
        var result = controller.Get(stationId);

        // Assert
        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        Assert.That(jsonResult.Value, Is.EqualTo(station));
        mockStationRepository.Received(1).Get(stationId);
    }

    [Test]
    public void Get_Returns_JsonResult_With_Null_When_Station_Not_Found()
    {
        // Arrange
        var stationId = Guid.NewGuid();
        mockStationRepository.Get(stationId).Returns((StationBase)null);

        // Act
        var result = controller.Get(stationId);

        // Assert
        Assert.That(result, Is.InstanceOf<JsonResult>());
        var jsonResult = (JsonResult)result;
        Assert.That(jsonResult.Value, Is.Null);
    }

    [Test]
    public void DeleteSongs_Returns_NotFound_When_Station_Null()
    {
        // Arrange
        var stationId = Guid.NewGuid();
        mockStationRepository.Get(stationId).Returns((StationBase)null);

        // Act
        var result = controller.DeleteSongs(stationId, 0, 1);

        // Assert
        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public void DeleteSongs_Returns_NotFound_When_Not_Enough_Songs()
    {
        // Arrange
        var stationId = Guid.NewGuid();
        var station = CreateTestStation(stationId, new List<string> { "song1", "song2" }); // Only 2 songs
        mockStationRepository.Get(stationId).Returns(station);

        // Act - Try to delete 3 songs starting from position 0
        var result = controller.DeleteSongs(stationId, 0, 3);

        // Assert
        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public void DeleteSongs_Returns_NotFound_When_Position_Out_Of_Range()
    {
        // Arrange
        var stationId = Guid.NewGuid();
        var station = CreateTestStation(stationId, new List<string> { "song1", "song2" });
        mockStationRepository.Get(stationId).Returns(station);

        // Act - Try to delete from position 2 (out of range for 2 songs)
        var result = controller.DeleteSongs(stationId, 2, 1);

        // Assert
        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public void DeleteSongs_Removes_Songs_And_Returns_NoContent()
    {
        // Arrange
        var stationId = Guid.NewGuid();
        var songIds = new List<string> { "song1", "song2", "song3", "song4" };
        var station = CreateTestStation(stationId, songIds);
        mockStationRepository.Get(stationId).Returns(station);

        // Act - Delete 2 songs starting from position 1
        var result = controller.DeleteSongs(stationId, 1, 2);

        // Assert
        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(station.SongIds, Has.Count.EqualTo(2));
        Assert.That(station.SongIds[0], Is.EqualTo("song1")); // First song remains
        Assert.That(station.SongIds[1], Is.EqualTo("song4")); // Last song moved down
    }

    [Test]
    public void DeleteSongs_Removes_Single_Song_Correctly()
    {
        // Arrange
        var stationId = Guid.NewGuid();
        var songIds = new List<string> { "song1", "song2", "song3" };
        var station = CreateTestStation(stationId, songIds);
        mockStationRepository.Get(stationId).Returns(station);

        // Act - Delete 1 song at position 1
        var result = controller.DeleteSongs(stationId, 1, 1);

        // Assert
        Assert.That(result, Is.InstanceOf<NoContentResult>());
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