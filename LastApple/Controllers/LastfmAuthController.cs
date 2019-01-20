using System;
using System.Threading.Tasks;
using LastfmApi;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Controllers
{
    [Route("lastfm/auth")]
    public class LastfmAuthController : Controller
    {
        private readonly ILastfmApi _lastfmApi;

        public LastfmAuthController(ILastfmApi lastfmApi)
        {
            _lastfmApi = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
        }

        [Route("")]
        public async Task<IActionResult> InitAuth()
        {
            var link        = Url.Link("CompleteAuth", new { token = "" });
            var redirectUrl = new Uri(link);
            var authUrl     = await _lastfmApi.StartWebAuthentication(redirectUrl);

            return Redirect(authUrl.ToString());
        }

        [Route("complete", Name = "CompleteAuth")]
        public async Task<IActionResult> CompleteAuth(string token)
        {
            await _lastfmApi.CompleteAuthentication(token);

            return Redirect("/");
        }

        [Route("state")]
        public IActionResult IsAuthenticated()
        {
            return Json(_lastfmApi.IsAuthenticated);
        }
    }
}