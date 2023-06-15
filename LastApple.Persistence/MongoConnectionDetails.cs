namespace LastApple.Persistence;

public record MongoConnectionDetails(string ConnectionString)
{
    public MongoConnectionDetails(): this("") {}
}