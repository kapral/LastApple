namespace AppleMusicApi;

public record SearchParams(string Term, ResourceType Types, int Limit = 100, int Offset = 0);