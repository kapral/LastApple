using System.Collections.Generic;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public record ArtistsStationDefinition : IStationDefinition
{
    public ICollection<string> Artists { get; } = new List<string>();

    public StationType StationType => StationType.Artists;
}