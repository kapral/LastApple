using System;

namespace LastfmApi.Api
{
    public class GetSessionResponse
    {
        public GetSessionResponse(Session session)
        {
            Session = session ?? throw new ArgumentNullException(nameof(session));
        }

        public Session Session { get; }
    }
}