namespace LastApple.Web.Models;

public record AppleMusicSessionData
{
    public string MusicUserToken { get; init; }

    public string MusicStorefrontId { get; init; }
}