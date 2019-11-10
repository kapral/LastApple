using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LastApple.PlaylistGeneration
{
    public class CacheItems<TItem>
    {
        public int Attempts { get; set; }

        public IEnumerable<TItem> Items { get; set; }

        public Task<IEnumerable<TItem>> Task { get; set; }

        public bool HasNoData => Attempts >= Constants.MaxRetryAttempts && Items == null || Items?.Any() == false;
    }
}