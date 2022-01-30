using System;
using System.Threading.Tasks;
using IF.Lastfm.Core.Api;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/lastfmlibrary")]
public class LastfmLibraryStationController : Controller
{
    private readonly IStationRepository stationRepository;
    private readonly IStationGenerator<LastfmLibraryStationDefinition> stationGenerator;
    private readonly IBackgroundProcessManager processManager;
    private readonly IUserApi userApi;
    private readonly ISessionProvider sessionProvider;

    public LastfmLibraryStationController(IStationRepository stationRepository,
                                          IStationGenerator<LastfmLibraryStationDefinition> stationGenerator,
                                          IBackgroundProcessManager processManager,
                                          IUserApi userApi,
                                          ISessionProvider sessionProvider)
    {
        this.stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
        this.stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
        this.userApi           = userApi ?? throw new ArgumentNullException(nameof(userApi));
        this.sessionProvider   = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
        this.processManager    = processManager ?? throw new ArgumentNullException(nameof(processManager));
    }

    [HttpPost]
    [Route("my")]
    public async Task<IActionResult> Create()
    {
        var session = await sessionProvider.GetSession();

        if (session == null)
            return Unauthorized();

        var user = await userApi.GetInfoAsync(session.LastfmUsername);

        var station = new Station<LastfmLibraryStationDefinition>
        {
            IsContinuous = true,
            Definition   = new LastfmLibraryStationDefinition { User = user.Content.Name },
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

        processManager.AddProcess(() => stationGenerator.TopUp(station, count));

        return NoContent();
    }
}