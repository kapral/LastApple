using System;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/lastfmlibrary")]
public class LastfmLibraryStationController(IStationRepository stationRepository,
                                            IStationGenerator<LastfmLibraryStationDefinition> stationGenerator,
                                            IBackgroundProcessManager processManager,
                                            IUserApi userApi,
                                            ISessionProvider sessionProvider,
                                            IStorefrontProvider storefrontProvider) : Controller
{
    [HttpPost]
    [Route("my")]
    public async Task<IActionResult> Create()
    {
        var session = await sessionProvider.GetSession();

        if (session.Id == Guid.Empty)
            return Unauthorized();

        var user = await userApi.GetInfoAsync(session.LastfmUsername);

        var definition = new LastfmLibraryStationDefinition(User: user.Content.Name);
        var station = new Station<LastfmLibraryStationDefinition>(definition)
        {
            IsContinuous = true,
            Id           = Guid.NewGuid()
        };

        stationRepository.Create(station);
        var storefront = await storefrontProvider.GetStorefront();

        processManager.AddProcess(() => stationGenerator.Generate(station, storefront));

        return Json(station);
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public async Task<ActionResult> TopUp(Guid stationId, int count)
    {
        if (stationRepository.Get(stationId) is not Station<LastfmLibraryStationDefinition> station)
            return NotFound();

        var storefront = await storefrontProvider.GetStorefront();

        processManager.AddProcess(() => stationGenerator.TopUp(station, storefront, count));

        return NoContent();
    }
}