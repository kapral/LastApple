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
        public async Task<IActionResult> InitAuth(string redirectUrl)
        {
            if (!Uri.TryCreate(redirectUrl, UriKind.Absolute, out var uri))
                return BadRequest();

            var authUrl = await _lastfmApi.StartWebAuthentication(uri);

            return Json(authUrl.ToString());
        }

        [HttpPost]
        public async Task<IActionResult> CompleteAuth(string token)
        {
            await _lastfmApi.CompleteAuthentication(token);

            return NoContent();
        }

        [Route("state")]
        public IActionResult IsAuthenticated()
        {
            return Json(_lastfmApi.IsAuthenticated);
        }
    }
}