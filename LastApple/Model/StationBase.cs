using System;
using System.Collections.Generic;

namespace LastApple.Model;

public abstract record StationBase
{
    public Guid Id { get; init; }

    public int Size { get; init; } = 20;

    public bool IsContinuous { get; init; }

    public bool IsGroupedByAlbum { get; init; }

    public List<string> SongIds { get; } = new();
}