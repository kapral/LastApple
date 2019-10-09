using LastfmApi;

namespace LastApple
{
    public interface ISessionProvider
    {
        Session Session { get; }
    }
}