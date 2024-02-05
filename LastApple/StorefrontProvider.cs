using System;
using System.Threading.Tasks;

namespace LastApple;

public class StorefrontProvider(ISessionProvider sessionProvider) : IStorefrontProvider
{
    private const string DefaultStorefront = "us";
            
    private readonly ISessionProvider sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));

    public async Task<string> GetStorefront()
    {
        var session = await sessionProvider.GetSession();
        return session?.MusicStorefrontId ?? DefaultStorefront;
    }
}