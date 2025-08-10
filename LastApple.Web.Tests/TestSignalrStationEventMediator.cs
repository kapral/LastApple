using System;
using LastApple.Web;
using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestSignalrStationEventMediator
{
    [Test]
    public void Constructor_Accepts_Valid_HubContext()
    {
        // Arrange
        var mockHubContext = Substitute.For<IHubContext<StationHub>>();
        
        // Act
        var mediator = new SignalrStationEventMediator(mockHubContext);
        
        // Assert
        Assert.That(mediator, Is.Not.Null);
        Assert.That(mediator, Is.InstanceOf<IStationEventMediator>());
    }

    [Test]
    public void NotifyTrackAdded_Does_Not_Throw()
    {
        // Arrange
        var mockHubContext = Substitute.For<IHubContext<StationHub>>();
        var mediator = new SignalrStationEventMediator(mockHubContext);
        var stationId = Guid.NewGuid();

        // Act & Assert
        Assert.DoesNotThrow(() => mediator.NotifyTrackAdded(stationId, "track-123", 5));
    }
}