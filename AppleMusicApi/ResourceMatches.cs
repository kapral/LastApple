using System.Collections.Generic;

namespace AppleMusicApi;

public record ResourceMatches<TAttributes>(ICollection<Resource<TAttributes>> Data) where TAttributes : class, IAttributes;