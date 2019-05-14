using System;
using AppleMusicApi;
using Microsoft.Extensions.Options;

namespace LastApple
{
    public class DeveloperTokenProvider : IDeveloperTokenProvider
    {
        private readonly IDeveloperTokenGenerator _tokenGenerator;
        private readonly AppCredentials _credentials;
        private (DateTimeOffset ExpiresAt, string Value) _currentToken;

        private readonly TimeSpan _tokenLifetime = TimeSpan.FromHours(24);

        public DeveloperTokenProvider(IDeveloperTokenGenerator tokenGenerator, IOptions<AppCredentials> credentials)
        {
            _tokenGenerator = tokenGenerator ?? throw new ArgumentNullException(nameof(tokenGenerator));
            _credentials = credentials?.Value ?? throw new ArgumentNullException(nameof(credentials));
        }

        public string GetToken()
        {
            if (_currentToken.ExpiresAt < DateTimeOffset.UtcNow.Add(_tokenLifetime / 2))
            {
                var nextExpiresAt = DateTimeOffset.UtcNow.Add(_tokenLifetime);

                _currentToken = (nextExpiresAt, _tokenGenerator.GenerateDeveloperToken(_credentials, _tokenLifetime));
            }

            return _currentToken.Value;
        }
    }
}