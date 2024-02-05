using System;
using Microsoft.AspNetCore.SignalR;

namespace LastApple.Web;

public class SignalrStationEventMediator(IHubContext<StationHub> hubContext) : IStationEventMediator
{
    private readonly IHubContext<StationHub> hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));

    public void NotifyTrackAdded(Guid stationId, string trackId, int position)
    {
        hubContext.Clients.All.SendAsync("trackAdded", stationId, trackId, position);
    }
}