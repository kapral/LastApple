using System;
using AppleMusicApi;
using Microsoft.Extensions.Options;

namespace LastApple.Web
{
    public class DeveloperTokenProvider : IDeveloperTokenProvider
    {
        private readonly IDeveloperTokenGenerator _tokenGenerator;
        private readonly AppCredentials _credentials;
        private (DateTimeOffset ExpiresAt, string Value) _currentToken;

        public DeveloperTokenProvider(IDeveloperTokenGenerator tokenGenerator, IOptions<AppCredentials> credentials)
        {
            _tokenGenerator = tokenGenerator ?? throw new ArgumentNullException(nameof(tokenGenerator));
            _credentials = credentials?.Value ?? throw new ArgumentNullException(nameof(credentials));
        }

        public string GetToken()
        {
            if (_currentToken.ExpiresAt < DateTimeOffset.UtcNow.AddMinutes(30))
            {
                var nextExpiresAt = DateTimeOffset.UtcNow.AddHours(1);

                _currentToken = (nextExpiresAt, _tokenGenerator.GenerateDeveloperToken(_credentials, TimeSpan.FromHours(1)));
            }

            return _currentToken.Value;
        }
    }
}