using System;

namespace LastApple;

public interface IStationEventMediator
{
    void NotifyTrackAdded(Guid stationId, string trackId, int position);
}