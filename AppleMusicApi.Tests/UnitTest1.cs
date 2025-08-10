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
    public void GenerateDeveloperToken_Returns_Non_Empty_String_For_Valid_Credentials()
    {
        var credentials = new AppCredentials
        {
            TeamId = "test-team",
            KeyId = "test-key",
            PrivateKey = "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JR0hBZ0VBTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEJHMHdid0lCQVFRZ1lVdjkxLzJZUWRrKzlJQTcKSW1EazROd2o2YTB3QkNJTTlkb1JJbkpzMXNoUkFOQ0FBUjNwVmVhWGZJQUtHcTA2cThiQy84V3Y1dzRVNGJCeQprU0pQUEpYUFl1djdjMnBHQlRaM1VDOFNOb3dOajhhc3FYejlhQThNeVFWRGt2ZVAzTjI3Ym9wdAotLS0tLUVORCBQUklWQVRFIEtFWS0tLS0t"
        };

        var result = generator.GenerateDeveloperToken(credentials, TimeSpan.FromHours(1));

        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.Not.Empty);
    }
}