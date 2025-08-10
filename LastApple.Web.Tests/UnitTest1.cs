using LastApple.Web;
using NUnit.Framework;

namespace LastApple.Web.Tests;

public class TestStationHub
{
    [Test]
    public void StationHub_Can_Be_Instantiated()
    {
        var hub = new StationHub();
        
        Assert.That(hub, Is.Not.Null);
    }
}