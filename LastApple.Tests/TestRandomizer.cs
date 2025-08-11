using System.Linq;
using NUnit.Framework;

namespace LastApple.Tests;

public class TestRandomizer
{
    private IRandomizer randomizer;

    [SetUp]
    public void Setup()
    {
        randomizer = new Randomizer();
    }

    [Test]
    public void NextStandard_Returns_Value_Within_Range()
    {
        const int maxValue = 10;

        var results = Enumerable.Range(0, 100)
                                .Select(_ => randomizer.NextStandard(maxValue))
                                .ToArray();

        Assert.That(results, Has.All.InRange(0, maxValue - 1));
    }

    [Test]
    public void NextStandard_Returns_Different_Values()
    {
        const int maxValue = 100;

        var results = Enumerable.Range(0, 50)
                                .Select(_ => randomizer.NextStandard(maxValue))
                                .Distinct()
                                .ToArray();

        Assert.That(results.Length, Is.GreaterThan(1));
    }

    [Test]
    public void NextDecreasing_Returns_Value_Within_Range()
    {
        const int maxValue = 10;

        var results = Enumerable.Range(0, 100)
                                .Select(_ => randomizer.NextDecreasing(maxValue))
                                .ToArray();

        Assert.That(results, Has.All.InRange(0, maxValue - 1));
    }

    [Test]
    public void NextDecreasing_Favors_Lower_Numbers()
    {
        const int maxValue = 100;
        const int sampleSize = 1000;

        var results = Enumerable.Range(0, sampleSize)
                                .Select(_ => randomizer.NextDecreasing(maxValue))
                                .ToArray();

        var lowNumbers = results.Count(x => x < maxValue / 3);
        var highNumbers = results.Count(x => x >= maxValue * 2 / 3);

        Assert.That(lowNumbers, Is.GreaterThan(highNumbers));
    }

    [Test]
    public void NextDecreasing_Returns_Different_Values()
    {
        const int maxValue = 100;

        var results = Enumerable.Range(0, 50)
                                .Select(_ => randomizer.NextDecreasing(maxValue))
                                .Distinct()
                                .ToArray();

        Assert.That(results.Length, Is.GreaterThan(1));
    }
}