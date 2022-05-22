using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/tags")]
public class TagsStationController : Controller
{
    private readonly IStationRepository                       stationRepository;
    private readonly IStationGenerator<TagsStationDefinition> stationGenerator;
    private readonly IBackgroundProcessManager                backgroundProcessManager;

    public TagsStationController(IStationRepository stationRepository,
                                 IStationGenerator<TagsStationDefinition> stationGenerator,
                                 IBackgroundProcessManager backgroundProcessManager)
    {
        this.stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
        this.stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
        this.backgroundProcessManager = backgroundProcessManager ??
                                        throw new ArgumentNullException(nameof(backgroundProcessManager));
    }

    [HttpPost]
    [Route("{tag}")]

    public IActionResult Create(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
            throw new ArgumentException("Value cannot be null or whitespace.", nameof(tag));

        var definition = new TagsStationDefinition(new[] { tag });
        var station = new Station<TagsStationDefinition>(definition)
        {
            IsContinuous = true,
            Id = Guid.NewGuid()
        };

        stationRepository.Create(station);

        backgroundProcessManager.AddProcess(() => stationGenerator.Generate(station));

        return Json(station);
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public ActionResult TopUp(Guid stationId, int count)
    {
        var station = stationRepository.Get(stationId) as Station<TagsStationDefinition>;

        if (station == null)
            return NotFound();

        backgroundProcessManager.AddProcess(() => stationGenerator.TopUp(station, count));

        return NoContent();
    }
}