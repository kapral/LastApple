using System;
using System.Collections.Generic;
using LastApple.Model;

namespace LastApple;

public class StationRepository : IStationRepository
{
    private readonly IDictionary<Guid, StationBase> stations = new Dictionary<Guid, StationBase>();

    public StationBase? Get(Guid id)
    {
        return stations.TryGetValue(id, out var station) ? station : null;
    }

    public void Create(StationBase station)
    {
        stations[station.Id] = station;
    }
}