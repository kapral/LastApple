using System;
using LastApple.Model;

namespace LastApple
{
    public interface IStationRepository
    {
        StationBase Get(Guid id);

        void Create(StationBase station);
    }
}