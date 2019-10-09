namespace LastApple
{
    public class SessionProvider : ISessionProvider
    {
        public SessionProvider(Session session)
        {
            Session = session;
        }

        public Session Session { get; }
    }
}