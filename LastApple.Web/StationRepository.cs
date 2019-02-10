using System;
using System.Collections.Generic;
using LastApple.Web.Model;

namespace LastApple.Web
{
    public class StationRepository : IStationRepository
    {
        private IDictionary<Guid, Station> _stations = new Dictionary<Guid, Station>();

        public Station Get(Guid id)
        {
            return _stations.TryGetValue(id, out var station) ? station : null;
        }

        public void Create(Station station)
        {
            _stations[station.Id] = station;
        }
    }
}