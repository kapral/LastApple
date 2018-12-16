using System;

namespace AppleMusicApi
{
    public interface IDeveloperTokenGenerator
    {
        string GenerateDeveloperToken(AppCredentials tokenParams, TimeSpan duration);
    }
}