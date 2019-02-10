using System;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/apple/auth")]
    public class AppleAuthController : Controller
    {
        private readonly IDeveloperTokenProvider _tokenProvider;

        public AppleAuthController(IDeveloperTokenProvider tokenProvider)
        {
            _tokenProvider = tokenProvider ?? throw new ArgumentNullException(nameof(tokenProvider));
        }

        [HttpGet]
        [Route("token")]
        public IActionResult GetToken()
        {
            return Json(_tokenProvider.GetToken());
        }
    }
}