using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LastApple.PlaylistGeneration;

// todo: this is looking extremely suspicious, needs refactoring
public class CacheItems<TItem>
{
    public int Attempts { get; set; }

    public IReadOnlyCollection<TItem>? Items { get; set; }

    public Task<IReadOnlyCollection<TItem>>? Task { get; set; }

    public bool HasNoData => Attempts >= Constants.MaxRetryAttempts && (Items == null || !Items.Any());
}