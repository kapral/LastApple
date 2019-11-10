using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/station/tags")]
    public class TagsStationController : Controller
    {
        private readonly IStationRepository                       _stationRepository;
        private readonly IStationGenerator<TagsStationDefinition> _stationGenerator;
        private readonly IBackgroundProcessManager                _backgroundProcessManager;

        public TagsStationController(IStationRepository stationRepository,
            IStationGenerator<TagsStationDefinition> stationGenerator,
            IBackgroundProcessManager backgroundProcessManager)
        {
            _stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
            _stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
            _backgroundProcessManager = backgroundProcessManager ??
                                        throw new ArgumentNullException(nameof(backgroundProcessManager));
        }

        [HttpPost]
        [Route("{tag}")]

        public IActionResult Create(string tag)
        {
            if (string.IsNullOrWhiteSpace(tag))
                throw new ArgumentException("Value cannot be null or whitespace.", nameof(tag));

            var station = new Station<TagsStationDefinition>
            {
                IsContinuous = true,
                Definition   = new TagsStationDefinition(new[] { tag }), Id = Guid.NewGuid()
            };

            _stationRepository.Create(station);

            _backgroundProcessManager.AddProcess(() => _stationGenerator.Generate(station));

            return Json(station);
        }

        [HttpPost]
        [Route("{stationId}/topup/{count}")]
        public ActionResult TopUp(Guid stationId, int count)
        {
            var station = _stationRepository.Get(stationId) as Station<TagsStationDefinition>;

            _backgroundProcessManager.AddProcess(() => _stationGenerator.TopUp(station, count));

            return NoContent();
        }
    }
}