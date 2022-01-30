namespace LastApple.Web.Models;

public record LastfmCredentials
{
    public string Username { get; init; }

    public string Password { get; init; }
}