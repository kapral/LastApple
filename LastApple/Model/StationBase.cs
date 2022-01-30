using System;
using System.Collections.Generic;

namespace LastApple.Model;

public abstract class StationBase
{
    public Guid Id { get; set; }

    public int Size { get; } = 20;

    public bool IsContinuous { get; set; }

    public IList<string> SongIds { get; } = new List<string>();
}