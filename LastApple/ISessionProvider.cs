using System.Threading.Tasks;

namespace LastApple;

public interface ISessionProvider
{
    Task<Session> GetSession();
}