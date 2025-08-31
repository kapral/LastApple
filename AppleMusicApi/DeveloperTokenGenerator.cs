using System;
using System.Security.Cryptography;
using JWT.Algorithms;
using JWT.Builder;

namespace AppleMusicApi;

public class DeveloperTokenGenerator(TimeProvider timeProvider) : IDeveloperTokenGenerator
{
    public string GenerateDeveloperToken(AppCredentials credentials, TimeSpan duration)
    {
        ArgumentNullException.ThrowIfNull(credentials);

        ReadOnlySpan<byte> keyAsSpan = Convert.FromBase64String(credentials.PrivateKey);

        var prvKey = ECDsa.Create();
        prvKey.ImportPkcs8PrivateKey(keyAsSpan, out _);

        var now = timeProvider.GetUtcNow();

        return new JwtBuilder()
               .WithAlgorithm(new ES256Algorithm(ECDsa.Create(), prvKey))
               .AddHeader("kid", credentials.KeyId)
               .ExpirationTime(now.Add(duration).UtcDateTime)
               .IssuedAt(now.UtcDateTime)
               .Issuer(credentials.TeamId)
               .Encode();
    }
}