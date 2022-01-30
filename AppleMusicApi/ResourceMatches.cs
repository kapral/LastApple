using System.Collections.Generic;

namespace AppleMusicApi;

public record ResourceMatches<TAttributes> where TAttributes : class, IAttributes
{
    public ICollection<Resource<TAttributes>> Data { get; } = new List<Resource<TAttributes>>();
}