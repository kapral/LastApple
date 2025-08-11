using System;
using AppleMusicApi;
using NUnit.Framework;

namespace AppleMusicApi.Tests;

public class TestDeveloperTokenGenerator
{
    private IDeveloperTokenGenerator generator;

    [SetUp]
    public void Setup()
    {
        generator = new DeveloperTokenGenerator();
    }

    [Test]
    public void GenerateDeveloperToken_Throws_On_Null_Credentials()
    {
        Assert.That(() => generator.GenerateDeveloperToken(null, TimeSpan.FromHours(1)), 
            Throws.ArgumentNullException);
    }

    [Test]
    public void GenerateDeveloperToken_Throws_On_Invalid_Base64_Key()
    {
        var credentials = new AppCredentials
        {
            TeamId = "test-team",
            KeyId = "test-key",
            PrivateKey = "invalid-base64"
        };

        Assert.That(() => generator.GenerateDeveloperToken(credentials, TimeSpan.FromHours(1)), 
            Throws.InstanceOf<FormatException>());
    }

    [Test]
    public void GenerateDeveloperToken_Throws_On_Invalid_Key_Format()
    {
        var credentials = new AppCredentials
        {
            TeamId = "test-team",
            KeyId = "test-key", 
            PrivateKey = "dGVzdC1rZXk=" // "test-key" in base64 - valid base64 but invalid PKCS#8
        };

        Assert.That(() => generator.GenerateDeveloperToken(credentials, TimeSpan.FromHours(1)), 
            Throws.InstanceOf<System.Security.Cryptography.CryptographicException>());
    }
}