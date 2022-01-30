using System;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/similarartists")]
public class SimilarArtistsStationController : Controller
{
    private readonly IStationRepository                                 stationRepository;
    private readonly IStationGenerator<SimilarArtistsStationDefinition> stationGenerator;
    private readonly IBackgroundProcessManager                          backgroundProcessManager;

    public SimilarArtistsStationController(IStationRepository stationRepository,
                                           IStationGenerator<SimilarArtistsStationDefinition> stationGenerator,
                                           IBackgroundProcessManager backgroundProcessManager)
    {
        this.stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
        this.stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
        this.backgroundProcessManager = backgroundProcessManager ??
                                        throw new ArgumentNullException(nameof(backgroundProcessManager));
    }

    [HttpPost]
    [Route("{artist}")]

    public IActionResult Create(string artist)
    {
        if (string.IsNullOrWhiteSpace(artist))
            throw new ArgumentException("Value cannot be null or whitespace.", nameof(artist));

        var station = new Station<SimilarArtistsStationDefinition>
            { Definition = new SimilarArtistsStationDefinition(artist), Id = Guid.NewGuid(), IsContinuous = true };

        stationRepository.Create(station);

        backgroundProcessManager.AddProcess(() => stationGenerator.Generate(station));

        return Json(station);
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public ActionResult TopUp(Guid stationId, int count)
    {
        var station = stationRepository.Get(stationId) as Station<SimilarArtistsStationDefinition>;

        backgroundProcessManager.AddProcess(() => stationGenerator.TopUp(station, count));

        return NoContent();
    }
}