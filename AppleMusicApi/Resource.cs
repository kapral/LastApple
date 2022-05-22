namespace AppleMusicApi;

public record Resource<TAttributes>(string Id,
                                    ResourceType Type,
                                    string Href,
                                    TAttributes Attributes,
                                    Relationships Relationships) where TAttributes : class, IAttributes;