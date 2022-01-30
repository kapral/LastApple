namespace AppleMusicApi;

public class Resource<TAttributes> where TAttributes : class, IAttributes
{
    public string Id { get; set; }

    public ResourceType Type { get; set; }

    public string Href { get; set; }

    public TAttributes Attributes { get; set; }
        
    public Relationships Relationships { get; set; }
}