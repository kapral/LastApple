using System;
using AppleMusicApi;
using Microsoft.Extensions.Options;

namespace LastApple;

public class DeveloperTokenProvider : IDeveloperTokenProvider
{
    private readonly IDeveloperTokenGenerator tokenGenerator;
    private readonly AppCredentials credentials;
    private (DateTimeOffset ExpiresAt, string Value) currentToken;

    private readonly TimeSpan tokenLifetime = TimeSpan.FromHours(24);

    public DeveloperTokenProvider(IDeveloperTokenGenerator tokenGenerator, IOptions<AppCredentials> credentials)
    {
        this.tokenGenerator = tokenGenerator ?? throw new ArgumentNullException(nameof(tokenGenerator));
        this.credentials    = credentials?.Value ?? throw new ArgumentNullException(nameof(credentials));
    }

    public string GetToken()
    {
        if (currentToken.ExpiresAt < DateTimeOffset.UtcNow.Add(tokenLifetime / 2))
        {
            var nextExpiresAt = DateTimeOffset.UtcNow.Add(tokenLifetime);

            currentToken = (nextExpiresAt, tokenGenerator.GenerateDeveloperToken(credentials, tokenLifetime));
        }

        return currentToken.Value;
    }
}