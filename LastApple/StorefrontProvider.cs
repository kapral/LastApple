using System;
using System.Threading.Tasks;

namespace LastApple;

public class StorefrontProvider : IStorefrontProvider
{
    private const string DefaultStorefront = "us";
            
    private readonly ISessionProvider sessionProvider;

    public StorefrontProvider(ISessionProvider sessionProvider)
    {
        this.sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
    }

    public async Task<string> GetStorefront()
    {
        var session = await sessionProvider.GetSession();
        return session?.MusicStorefrontId ?? DefaultStorefront;
    }
}