using System;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LastApple.Web
{
    public class LastfmAuthFilter : ActionFilterAttribute
    {
        private readonly ILastfmSessionProvider _sessionProvider;
        private readonly ILastfmSessionKeyProvider _sessionKey;

        public LastfmAuthFilter(ILastfmSessionProvider sessionProvider, ILastfmSessionKeyProvider sessionKey)
        {
            _sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
            _sessionKey = sessionKey ?? throw new ArgumentNullException(nameof(sessionKey));
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var sessionId = context.HttpContext.Request.Cookies["SessionId"];

            if(string.IsNullOrWhiteSpace(sessionId))
                return;

            var sessionKey = _sessionProvider.GetKey(Guid.Parse(sessionId));

            if(sessionKey == null)
                return;

            _sessionKey.Value = sessionKey;
        }
    }
}