using LastfmApi;

namespace LastApple.Web
{
    public interface ILastfmSessionKeyProvider : ISessionKey
    {
        new string Value { get; set; }
    }
}