using System;
using System.Collections.Generic;

namespace LastApple.Web
{
    public class LastfmSessionProvider : ILastfmSessionProvider
    {
        private readonly IDictionary<Guid, string> _keyStorage = new Dictionary<Guid, string>();

        public string GetKey(Guid sessionId)
        {
            if (_keyStorage.TryGetValue(sessionId, out var key))
                return key;

            return null;
        }

        public void AddKey(Guid sessionId, string key)
        {
            _keyStorage[sessionId] = key;
        }
    }
}