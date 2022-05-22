using LastApple.PlaylistGeneration;

namespace LastApple.Model;

public record Station<TDefinition>(TDefinition Definition) : StationBase where TDefinition : IStationDefinition;