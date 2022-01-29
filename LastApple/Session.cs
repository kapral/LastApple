using System;

namespace LastApple
{
    public class Session
    {
        public Guid Id { get; set; }

        public string LastfmSessionKey { get; set; }

        public string LastfmUsername { get; set; }

        public string MusicUserToken { get; set; }

        public string MusicStorefrontId { get; set; }
    }
}