using System.Linq;
using System.Threading.Tasks;
using LastApple.PlaylistGeneration;
using NUnit.Framework;

namespace LastApple.Tests.PlaylistGeneration;

public class TestCacheItems
{
    [Test]
    public void HasNoData_Returns_True_When_Max_Attempts_Reached_And_Items_Null()
    {
        var cacheItems = new CacheItems<string>
        {
            Attempts = Constants.MaxRetryAttempts,
            Items = null
        };

        Assert.That(cacheItems.HasNoData, Is.True);
    }

    [Test]
    public void HasNoData_Returns_True_When_Max_Attempts_Reached_And_Items_Empty()
    {
        var cacheItems = new CacheItems<string>
        {
            Attempts = Constants.MaxRetryAttempts,
            Items = new string[0]
        };

        Assert.That(cacheItems.HasNoData, Is.True);
    }

    [Test]
    public void HasNoData_Returns_False_When_Attempts_Below_Max_And_Items_Null()
    {
        var cacheItems = new CacheItems<string>
        {
            Attempts = Constants.MaxRetryAttempts - 1,
            Items = null
        };

        Assert.That(cacheItems.HasNoData, Is.False);
    }

    [Test]
    public void HasNoData_Returns_False_When_Attempts_Below_Max_And_Items_Empty()
    {
        var cacheItems = new CacheItems<string>
        {
            Attempts = Constants.MaxRetryAttempts - 1,
            Items = new string[0]
        };

        Assert.That(cacheItems.HasNoData, Is.False);
    }

    [Test]
    public void HasNoData_Returns_False_When_Max_Attempts_Reached_But_Items_Present()
    {
        var cacheItems = new CacheItems<string>
        {
            Attempts = Constants.MaxRetryAttempts,
            Items = new[] { "item1", "item2" }
        };

        Assert.That(cacheItems.HasNoData, Is.False);
    }

    [Test]
    public void HasNoData_Returns_False_When_No_Attempts_And_Items_Present()
    {
        var cacheItems = new CacheItems<string>
        {
            Attempts = 0,
            Items = new[] { "item1" }
        };

        Assert.That(cacheItems.HasNoData, Is.False);
    }

    [Test]
    public void Task_Property_Can_Be_Set_And_Retrieved()
    {
        var cacheItems = new CacheItems<string>();
        var task = Task.FromResult<IReadOnlyCollection<string>>(new[] { "test" });

        cacheItems.Task = task;

        Assert.That(cacheItems.Task, Is.EqualTo(task));
    }

    [Test]
    public void Items_Property_Can_Be_Set_And_Retrieved()
    {
        var cacheItems = new CacheItems<string>();
        var items = new[] { "item1", "item2" };

        cacheItems.Items = items;

        Assert.That(cacheItems.Items, Is.EqualTo(items));
        Assert.That(cacheItems.Items.Count(), Is.EqualTo(2));
    }
}