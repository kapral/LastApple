using System;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/similarartists")]
public class SimilarArtistsStationController : Controller
{
    private readonly IStationRepository                                 _stationRepository;
    private readonly IStationGenerator<SimilarArtistsStationDefinition> _stationGenerator;
    private readonly IBackgroundProcessManager                          _backgroundProcessManager;

    public SimilarArtistsStationController(IStationRepository stationRepository,
                                           IStationGenerator<SimilarArtistsStationDefinition> stationGenerator,
                                           IBackgroundProcessManager backgroundProcessManager)
    {
        _stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
        _stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
        _backgroundProcessManager = backgroundProcessManager ??
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

        _stationRepository.Create(station);

        _backgroundProcessManager.AddProcess(() => _stationGenerator.Generate(station));

        return Json(station);
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public ActionResult TopUp(Guid stationId, int count)
    {
        var station = _stationRepository.Get(stationId) as Station<SimilarArtistsStationDefinition>;

        _backgroundProcessManager.AddProcess(() => _stationGenerator.TopUp(station, count));

        return NoContent();
    }
}