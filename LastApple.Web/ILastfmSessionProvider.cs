using System;

namespace LastApple.Web
{
    public interface ILastfmSessionProvider
    {
        string GetKey(Guid sessionId);

        void AddKey(Guid sessionId, string key);
    }
}