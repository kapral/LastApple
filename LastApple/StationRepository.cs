using System;
using System.Collections.Generic;
using LastApple.Model;

namespace LastApple
{
    public class StationRepository : IStationRepository
    {
        private readonly IDictionary<Guid, StationBase> _stations = new Dictionary<Guid, StationBase>();

        public StationBase Get(Guid id)
        {
            return _stations.TryGetValue(id, out var station) ? station : null;
        }

        public void Create(StationBase station)
        {
            _stations[station.Id] = station;
        }
    }
}