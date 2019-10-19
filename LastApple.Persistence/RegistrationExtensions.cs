using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace LastApple.Persistence
{
    public static class RegistrationExtensions
    {
        public static void AddPersistence(this IServiceCollection services)
        {
            services.AddSingleton<IMongoClient>(sp =>
            {
                var connectionDetails = sp.GetService<IOptions<MongoConnectionDetails>>();

                return new MongoClient(connectionDetails.Value.ConnectionString);
            });

            services.AddSingleton<ISessionRepository, SessionRepository>();
        }
    }
}