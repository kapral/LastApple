using System;
using System.Collections.Generic;

namespace LastApple.Model
{
    public class Station
    {
        public Guid Id { get; set; }

        public IList<string>  SongIds { get; } = new List<string>();
    }
}