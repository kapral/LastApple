using System;

namespace LastApple;

public class Randomizer : IRandomizer {
    private readonly Random random = new();

    public int NextStandard(int lessThen) {
        return random.Next(lessThen);
    }

    /// <summary>
    /// Returns a non-negative random number less then specified
    /// maximum with higher probability of lower numbers
    /// </summary>
    public int NextDecreasing(int lessThen) {
        return (int) (Math.Pow(random.NextDouble(), 1.5) * lessThen);
    }
}