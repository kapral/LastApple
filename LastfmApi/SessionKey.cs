namespace LastfmApi
{
    public class SessionKey : ISessionKey
    {
        public SessionKey(string value)
        {
            Value = value;
        }

        public string Value { get; }
    }
}