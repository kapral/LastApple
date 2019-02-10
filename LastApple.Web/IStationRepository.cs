using System;
using LastApple.Web.Model;

namespace LastApple.Web
{
    public interface IStationRepository
    {
        Station Get(Guid id);

        void Create(Station station);
    }
}