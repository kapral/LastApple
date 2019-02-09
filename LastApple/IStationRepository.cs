using System;
using LastApple.Model;

namespace LastApple
{
    public interface IStationRepository
    {
        Station Get(Guid id);

        void Create(Station station);
    }
}