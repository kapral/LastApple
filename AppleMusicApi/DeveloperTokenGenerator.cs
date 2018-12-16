using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using Jose;

namespace AppleMusicApi
{
    public class DeveloperTokenGenerator : IDeveloperTokenGenerator
    {
        public string GenerateDeveloperToken(AppCredentials credentials, TimeSpan duration)
        {
            var issuedAt  = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var expiresAt = DateTimeOffset.UtcNow.Add(duration).ToUnixTimeSeconds();

            var headers = new Dictionary<string, object>
            {
                { "alg", "ES256" },
                { "kid", credentials.KeyId },
                { "typ", "JWT" }
            };
            var payload = new Dictionary<string, object>
            {
                { "iss", credentials.TeamId },
                { "iat", issuedAt },
                { "exp", expiresAt }
            };

            var secret     = Convert.FromBase64String(credentials.SecretBase64);
            var privateKey = CngKey.Import(secret, CngKeyBlobFormat.Pkcs8PrivateBlob);

            return JWT.Encode(payload, privateKey, JwsAlgorithm.ES256, headers);
        }
    }
}