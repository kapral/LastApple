using System.Linq;
using System.Threading;
using Microsoft.AspNetCore.SignalR;

namespace LastApple.Web.Tests;

public class TestSignalrStationEventMediator
{
    [Test]
    public void NotifyTrackAdded_Does_Not_Throw()
    {
        var mockHubContext = Substitute.For<IHubContext<StationHub>>();
        var mockClients = Substitute.For<IHubClients>();
        var mockClientProxy = Substitute.For<IClientProxy>();

        mockHubContext.Clients.Returns(mockClients);
        mockClients.All.Returns(mockClientProxy);

        var mediator = new SignalrStationEventMediator(mockHubContext);
        var stationId = Guid.NewGuid();

        mediator.NotifyTrackAdded(stationId, "track-123", 5);

        var expectedArgs = new object[]
        {
            stationId, "track-123", 5
        };

        mockClientProxy.Received(1)
                       .SendCoreAsync("trackAdded",
                                      Arg.Is<object[]>(items => items.SequenceEqual(expectedArgs)),
                                      Arg.Any<CancellationToken>());
    }
}