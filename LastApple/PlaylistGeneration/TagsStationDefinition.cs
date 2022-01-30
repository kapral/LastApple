using System;
using System.Collections.Generic;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class TagsStationDefinition : IStationDefinition
{
    public TagsStationDefinition(IEnumerable<string> tags)
    {
        Tags = tags ?? throw new ArgumentNullException(nameof(tags));
    }

    public IEnumerable<string> Tags { get; }

    public StationType StationType => StationType.Tags;
}