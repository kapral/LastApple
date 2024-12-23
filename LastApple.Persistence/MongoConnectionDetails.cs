namespace LastApple.Persistence;

public record MongoConnectionDetails(string ConnectionString, string DatabaseName)
{
    public MongoConnectionDetails(): this("", "") {}
}