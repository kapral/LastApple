using System;

namespace LastApple
{
    public interface ILastfmSessionProvider
    {
        string GetKey(Guid sessionId);

        void AddKey(Guid sessionId, string key);
    }
}