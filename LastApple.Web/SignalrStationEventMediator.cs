using System;
using Microsoft.AspNetCore.SignalR;

namespace LastApple.Web;

public class SignalrStationEventMediator : IStationEventMediator
{
    private readonly IHubContext<StationHub> _hubContext;

    public SignalrStationEventMediator(IHubContext<StationHub> hubContext)
    {
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
    }

    public void NotifyTrackAdded(Guid stationId, string trackId, int position)
    {
        _hubContext.Clients.All.SendAsync("trackAdded", stationId, trackId, position);
    }
}