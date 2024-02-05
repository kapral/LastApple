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
                                            ISessionProvider sessionProvider) : Controller
{
    private readonly IStationRepository stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
    private readonly IStationGenerator<LastfmLibraryStationDefinition> stationGenerator = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
    private readonly IBackgroundProcessManager processManager = processManager ?? throw new ArgumentNullException(nameof(processManager));
    private readonly IUserApi userApi = userApi ?? throw new ArgumentNullException(nameof(userApi));
    private readonly ISessionProvider sessionProvider = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));

    [HttpPost]
    [Route("my")]
    public async Task<IActionResult> Create()
    {
        var session = await sessionProvider.GetSession();

        if (session == null)
            return Unauthorized();

        var user = await userApi.GetInfoAsync(session.LastfmUsername);

        var definition = new LastfmLibraryStationDefinition(User: user.Content.Name);
        var station = new Station<LastfmLibraryStationDefinition>(definition)
        {
            IsContinuous = true,
            Id           = Guid.NewGuid()
        };

        stationRepository.Create(station);

        processManager.AddProcess(() => stationGenerator.Generate(station));

        return Json(station);
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public ActionResult TopUp(Guid stationId, int count)
    {
        var station = stationRepository.Get(stationId) as Station<LastfmLibraryStationDefinition>;

        if (station == null)
            return NotFound();

        processManager.AddProcess(() => stationGenerator.TopUp(station, count));

        return NoContent();
    }
}