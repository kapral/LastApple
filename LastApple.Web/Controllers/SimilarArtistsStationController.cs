using System;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/similarartists")]
public class SimilarArtistsStationController(IStationRepository stationRepository,
                                             IStationGenerator<SimilarArtistsStationDefinition> stationGenerator,
                                             IBackgroundProcessManager backgroundProcessManager) : Controller
{
    private readonly IStationRepository                                 stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
    private readonly IStationGenerator<SimilarArtistsStationDefinition> stationGenerator = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
    private readonly IBackgroundProcessManager                          backgroundProcessManager = backgroundProcessManager ??
                                                                                                   throw new ArgumentNullException(nameof(backgroundProcessManager));

    [HttpPost]
    [Route("{artist}")]

    public IActionResult Create(string artist)
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

        backgroundProcessManager.AddProcess(() => stationGenerator.Generate(station));

        return Json(station);
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public ActionResult TopUp(Guid stationId, int count)
    {
        var station = stationRepository.Get(stationId) as Station<SimilarArtistsStationDefinition>;

        if (station == null)
            return NotFound();

        backgroundProcessManager.AddProcess(() => stationGenerator.TopUp(station, count));

        return NoContent();
    }
}