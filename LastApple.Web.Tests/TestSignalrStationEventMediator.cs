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
        var mockHubContext = Substitute.For<IHubContext<StationHub>>();
        
        var mediator = new SignalrStationEventMediator(mockHubContext);
        
        Assert.That(mediator, Is.Not.Null);
        Assert.That(mediator, Is.InstanceOf<IStationEventMediator>());
    }

    [Test]
    public void NotifyTrackAdded_Does_Not_Throw()
    {
        var mockHubContext = Substitute.For<IHubContext<StationHub>>();
        var mediator = new SignalrStationEventMediator(mockHubContext);
        var stationId = Guid.NewGuid();

        Assert.DoesNotThrow(() => mediator.NotifyTrackAdded(stationId, "track-123", 5));
    }
}