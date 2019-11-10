﻿using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration {
    public interface IStationGenerator<TStation> where TStation : IStationDefinition {
        Task Generate(Station<TStation> station);
        Task TopUp(Station<TStation> station, int count);
    }
}