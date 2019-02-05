using LastfmApi;

namespace LastApple
{
    public interface ILastfmSessionKeyProvider : ISessionKey
    {
        new string Value { get; set; }
    }
}