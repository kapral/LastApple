using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastfmApi;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/station/lastfmlibrary")]
    public class LastfmLibraryStationController : Controller
    {
        private readonly IStationRepository stationRepository;
        private readonly IStationGenerator<LastfmLibraryStationDefinition> stationGenerator;
        private readonly IBackgroundProcessManager processManager;
        private readonly ILastfmApi lastfmApi;
        private readonly ISessionProvider sessionProvider;

        public LastfmLibraryStationController(IStationRepository stationRepository,
            IStationGenerator<LastfmLibraryStationDefinition> stationGenerator,
            IBackgroundProcessManager processManager,
            ILastfmApi lastfmApi,
            ISessionProvider sessionProvider)
        {
            this.stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
            this.stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
            this.lastfmApi         = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            this.sessionProvider   = sessionProvider ?? throw new ArgumentNullException(nameof(sessionProvider));
            this.processManager    = processManager ?? throw new ArgumentNullException(nameof(processManager));
        }

        [HttpPost]
        [Route("my")]
        public async Task<IActionResult> Create()
        {
            var sessionKey = (await sessionProvider.GetSession()).LastfmSessionKey;

            if (string.IsNullOrWhiteSpace(sessionKey))
                return Unauthorized();

            var user = await lastfmApi.GetUserInfo(sessionKey);

            var station = new Station<LastfmLibraryStationDefinition>
            {
                IsContinuous = true,
                Definition   = new LastfmLibraryStationDefinition { User = user.Name }, Id = Guid.NewGuid()
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
}