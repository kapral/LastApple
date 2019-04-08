using System.Collections.Generic;

namespace AppleMusicApi
{
    public class ResourceMatches<TAttributes> where TAttributes : class, IAttributes
    {
        public IEnumerable<Resource<TAttributes>> Data { get; } = new List<Resource<TAttributes>>();
    }
}