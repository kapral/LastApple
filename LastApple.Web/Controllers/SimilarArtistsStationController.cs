using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/similarartists")]
public class SimilarArtistsStationController(IStationRepository stationRepository,
                                             IStationGenerator<SimilarArtistsStationDefinition> stationGenerator,
                                             IBackgroundProcessManager backgroundProcessManager,
                                             IStorefrontProvider storefrontProvider) : Controller
{
    [HttpPost]
    [Route("{artist}")]
    public async Task<IActionResult> Create(string artist)
    {
        if (string.IsNullOrWhiteSpace(artist))
            throw new ArgumentException("Value cannot be null or whitespace.", nameof(artist));

        var definition = new SimilarArtistsStationDefinition(artist);

        var station = new Station<SimilarArtistsStationDefinition>(definition)
        {
            Id           = Guid.NewGuid(),
            IsContinuous = true
        };

        stationRepository.Create(station);

        var storefront = await storefrontProvider.GetStorefront();
        backgroundProcessManager.AddProcess(() => stationGenerator.Generate(station, storefront));

        return Json(station);
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public async Task<ActionResult> TopUp(Guid stationId, int count)
    {
        var station = stationRepository.Get(stationId) as Station<SimilarArtistsStationDefinition>;

        if (station == null)
            return NotFound();

        var storefront = await storefrontProvider.GetStorefront();
        backgroundProcessManager.AddProcess(() => stationGenerator.TopUp(station, storefront, count));

        return NoContent();
    }
}