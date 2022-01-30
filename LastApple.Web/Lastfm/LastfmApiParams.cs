namespace LastApple.Web.Lastfm;

public record LastfmApiParams
{
    public string ApiKey { get; init; }

    public string Secret { get; init; }
}