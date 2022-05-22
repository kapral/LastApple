using System;
using AppleMusicApi;
using Microsoft.Extensions.Options;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests;

public class TestDeveloperTokenProvider
{
    private IDeveloperTokenGenerator tokenGenerator;
    private IOptions<AppCredentials> credentials;

    private IDeveloperTokenProvider tokenProvider;

    [SetUp]
    public void Setup()
    {
        tokenGenerator = Substitute.For<IDeveloperTokenGenerator>();
        credentials    = Substitute.For<IOptions<AppCredentials>>();

        credentials.Value.Returns(new AppCredentials(PrivateKey: "pk", KeyId: "kid", TeamId: "tid"));

        tokenProvider = new DeveloperTokenProvider(tokenGenerator, credentials);
    }

    [Test]
    public void Constructor_Throws_On_Null_Arguments()
    {
        Assert.That(() => new DeveloperTokenProvider(null, credentials), Throws.ArgumentNullException);
        Assert.That(() => new DeveloperTokenProvider(tokenGenerator, null), Throws.ArgumentNullException);
    }

    [Test]
    public void GetToken_Generates_Token_First_Time_And_Reuses_It()
    {
        const string token = "generated-token";

        tokenGenerator.GenerateDeveloperToken(credentials.Value, TimeSpan.FromHours(24))
                      .Returns(token);

        var result1 = tokenProvider.GetToken();
        var result2 = tokenProvider.GetToken();

        Assert.That(result1, Is.EqualTo(token));
        Assert.That(result2, Is.EqualTo(result1));

        tokenGenerator.Received(1).GenerateDeveloperToken(credentials.Value, TimeSpan.FromHours(24));
    }
}