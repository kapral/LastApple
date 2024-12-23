using System;
using System.Threading.Tasks;
using NSubstitute;
using NUnit.Framework;

namespace LastApple.Tests;

public class TestStorefrontProvider
{
    private ISessionProvider sessionProvider;
    private IStorefrontProvider storefrontProvider;

    [SetUp]
    public void Init()
    {
        sessionProvider = Substitute.For<ISessionProvider>();

        storefrontProvider = new StorefrontProvider(sessionProvider);
    }

    [Test]
    public async Task GetStorefront_Returns_Storefront_From_Session()
    {
        sessionProvider.GetSession()
                       .Returns(new Session(Id: Guid.NewGuid(),
                                            LastActivityAt: DateTimeOffset.Now,
                                            StartedAt: DateTimeOffset.MinValue,
                                            MusicStorefrontId: "ua",
                                            LastfmSessionKey: null,
                                            LastfmUsername: null,
                                            MusicUserToken: null));

        Assert.That(await storefrontProvider.GetStorefront(), Is.EqualTo("ua"));
    }

    [Test]
    public async Task GetStorefront_Returns_Default_Storefront_If_No_Session()
    {
        sessionProvider.GetSession().Returns(new Session(Id: Guid.Empty,
                                                         LastActivityAt: DateTimeOffset.Now,
                                                         StartedAt: DateTimeOffset.MinValue,
                                                         MusicStorefrontId: null,
                                                         LastfmSessionKey: null,
                                                         LastfmUsername: null,
                                                         MusicUserToken: null));

        Assert.That(await storefrontProvider.GetStorefront(), Is.EqualTo("us"));
    }

    [Test]
    public async Task GetStorefront_Returns_Default_Storefront_If_No_Storefront_On_Session()
    {
        sessionProvider.GetSession()
                       .Returns(new Session(Id: Guid.NewGuid(),
                                            LastActivityAt: DateTimeOffset.Now,
                                            StartedAt: DateTimeOffset.MinValue,
                                            MusicStorefrontId: null,
                                            LastfmSessionKey: null,
                                            LastfmUsername: null,
                                            MusicUserToken: null));

        Assert.That(await storefrontProvider.GetStorefront(), Is.EqualTo("us"));
    }
}