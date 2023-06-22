﻿namespace AppleMusicApi;

public record AppCredentials(string PrivateKey,
                             string KeyId,
                             string TeamId)
{
    public AppCredentials() : this("", "", "") {}
}