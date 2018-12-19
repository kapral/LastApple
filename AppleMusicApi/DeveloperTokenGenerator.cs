using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using Jose;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Security.Cryptography;

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

            var privateKey = GetPrivateKey(credentials.PrivateKey);

            return JWT.Encode(payload, privateKey, JwsAlgorithm.ES256, headers);
        }

        private static CngKey GetPrivateKey(string key)
        {
            var ecPrivateKeyParameters = (ECPrivateKeyParameters)new PemReader(new StringReader(key)).ReadObject();
            var x                      = ecPrivateKeyParameters.Parameters.G.AffineXCoord.GetEncoded();
            var y                      = ecPrivateKeyParameters.Parameters.G.AffineYCoord.GetEncoded();
            var d                      = ecPrivateKeyParameters.D.ToByteArrayUnsigned();

            return EccKey.New(x, y, d);
        }
    }
}