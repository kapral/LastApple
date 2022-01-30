namespace AppleMusicApi;

public record SearchParams
{
    public string Term { get; init; }

    public ResourceType Types { get; init; }

    public int Limit { get; init; } = 100;

    public int Offset { get; init; } = 0;
}