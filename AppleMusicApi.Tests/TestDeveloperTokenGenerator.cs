using Microsoft.Extensions.Time.Testing;

namespace AppleMusicApi.Tests;

public class TestDeveloperTokenGenerator
{
    private DeveloperTokenGenerator generator;
    private FakeTimeProvider timeProvider = new();

    [SetUp]
    public void Setup()
    {
        generator = new DeveloperTokenGenerator(timeProvider);
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

    [Test]
    public void GenerateDeveloperToken_Returns_Token_For_Valid_Credentials()
    {
        timeProvider.SetUtcNow(new DateTimeOffset(2025, 1, 1, 12, 0, 0, TimeSpan.Zero));

        var credentials = new AppCredentials
        {
            TeamId     = "test-team",
            KeyId      = "test-key",
            PrivateKey = "MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgZIOjbeKzHSaWQDRbQiI/fIVnnpe36tTQppuDi2qUZKehRANCAAQP37r7LefgevTCC7zGBHbl+HlRgJ/tCiXnSO6bFbvSUrnlya9RQZpkhVSDC9X2q6PGVka9xZW+po0dNWcqoWpk" // "test-key" in base64 - valid base64 but invalid PKCS#8
        };

        var generatedToken = generator.GenerateDeveloperToken(credentials, TimeSpan.FromHours(1));

        Assert.That(generatedToken.Length, Is.EqualTo(218));
        Assert.That(generatedToken, Does.StartWith("eyJraWQiOiJ0ZXN0LWtleSIsInR5cCI6IkpXVCIsImFsZyI6IkVTMjU2In0.eyJleHAiOjE3MzU3MzY0MDAsImlhdCI6MTczNTczMjgwMCwiaXNzIjoidGVzdC10ZWFtIn0."));
    }
}