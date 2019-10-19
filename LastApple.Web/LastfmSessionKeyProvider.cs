using System;
using System.Threading.Tasks;
using LastfmApi;

namespace LastApple.Web
{
    public class LastfmSessionKeyProvider : ISessionKeyProvider
    {
        private readonly ISessionProvider sessionProvider;

        public LastfmSessionKeyProvider(ISessionProvider sessionProvider)
        {
            this.sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
        }

        public async Task<string> GetSessionKey()
        {
            var currentSession = await sessionProvider.GetSession();

            return currentSession?.LastfmSessionKey;
        }
    }
}