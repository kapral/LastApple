using System.Threading.Tasks;

namespace LastApple;

public interface IStorefrontProvider
{
    Task<string> GetStorefront();
}