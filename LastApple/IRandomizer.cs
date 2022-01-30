namespace LastApple;

public interface IRandomizer {
    int NextStandard(int lessThen);
        
    /// <summary>
    /// Returns a non-negative random number less then specified
    /// maximum with higher probability of lower numbers
    /// </summary>
    /// <param name="lessThen"></param>
    int NextDecreasing(int lessThen);
}