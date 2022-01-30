namespace AppleMusicApi;

public record AppCredentials
{
    public string PrivateKey { get; init; }

    public string KeyId { get; init; }

    public string TeamId { get; init; }
}