using System.Threading.Tasks;

namespace LastApple;

public class StorefrontProvider(ISessionProvider sessionProvider) : IStorefrontProvider
{
    private const string DefaultStorefront = "us";

    public async Task<string> GetStorefront()
    {
        var session = await sessionProvider.GetSession();
        return session.MusicStorefrontId ?? DefaultStorefront;
    }
}