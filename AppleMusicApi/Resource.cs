namespace AppleMusicApi;

public record Resource<TAttributes> where TAttributes : class, IAttributes
{
    public string Id { get; init; }

    public ResourceType Type { get; init; }

    public string Href { get; init; }

    public TAttributes Attributes { get; init; }

    public Relationships Relationships { get; init; }
}