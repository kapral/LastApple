using System;
using System.Collections.Generic;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class TagsStationDefinition(IEnumerable<string> tags) : IStationDefinition
{
    public IEnumerable<string> Tags { get; } = tags ?? throw new ArgumentNullException(nameof(tags));

    public StationType StationType => StationType.Tags;
}