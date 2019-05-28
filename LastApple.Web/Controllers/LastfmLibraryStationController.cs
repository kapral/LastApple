using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastfmApi;
using LastfmPlayer.Core.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/station/lastfmlibrary")]
    public class LastfmLibraryStationController : Controller
    {
        private readonly IStationRepository                                _stationRepository;
        private readonly IStationGenerator<LastfmLibraryStationDefinition> _stationGenerator;
        private readonly IBackgroundProcessManager                         _backgroundProcessManager;
        private readonly ILastfmApi                                        _lastfmApi;

        public LastfmLibraryStationController(IStationRepository stationRepository,
            IStationGenerator<LastfmLibraryStationDefinition> stationGenerator,
            IBackgroundProcessManager backgroundProcessManager, ILastfmApi lastfmApi)
        {
            _stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
            _stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
            _lastfmApi         = lastfmApi ?? throw new ArgumentNullException(nameof(lastfmApi));
            _backgroundProcessManager = backgroundProcessManager ??
                                        throw new ArgumentNullException(nameof(backgroundProcessManager));
        }

        [HttpPost]
        [Route("my")]
        [ServiceFilter(typeof(LastfmAuthFilter))]
        public async Task<IActionResult> Create()
        {
            var user = await _lastfmApi.GetUserInfo();

            var station = new Station<LastfmLibraryStationDefinition>
            {
                IsContinuous = true,
                Definition   = new LastfmLibraryStationDefinition { User = user.Name }, Id = Guid.NewGuid()
            };

            _stationRepository.Create(station);

            _backgroundProcessManager.AddProcess(() => _stationGenerator.Generate(station));

            return Json(station);
        }

        [HttpPost]
        [Route("{stationId}/topup/{count}")]
        public ActionResult TopUp(Guid stationId, int count)
        {
            var station = _stationRepository.Get(stationId) as Station<LastfmLibraryStationDefinition>;

            _backgroundProcessManager.AddProcess(() => _stationGenerator.TopUp(station, count));

            return NoContent();
        }
    }
}