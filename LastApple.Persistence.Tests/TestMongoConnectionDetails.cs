namespace LastApple.Persistence.Tests;

public class TestMongoConnectionDetails
{
    [Test]
    public void Constructor_Sets_Properties_Correctly()
    {
        var connectionString = "mongodb://localhost:27017";
        var databaseName = "testdb";

        var details = new MongoConnectionDetails(connectionString, databaseName);

        Assert.That(details.ConnectionString, Is.EqualTo(connectionString));
        Assert.That(details.DatabaseName, Is.EqualTo(databaseName));
    }

    [Test]
    public void Default_Constructor_Sets_Empty_Values()
    {
        var details = new MongoConnectionDetails();

        Assert.That(details.ConnectionString, Is.EqualTo(""));
        Assert.That(details.DatabaseName, Is.EqualTo(""));
    }
}