namespace LastApple.Web.Lastfm;

public record LastfmApiParams(string ApiKey,
                              string Secret)
{
    public LastfmApiParams() : this("", "") {}
}