using LastApple.PlaylistGeneration;

namespace LastApple.Model;

public record Station<TDefinition> : StationBase where TDefinition : IStationDefinition
{
    public TDefinition Definition { get; init; }
}