using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastfmPlayer.Core.PlaylistGeneration;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers
{
    [Route("api/station/tag")]
    public class TagStationController : Controller
    {
        private readonly IStationRepository                       _stationRepository;
        private readonly IStationGenerator<TagsStationDefinition> _stationGenerator;

        public TagStationController(IStationRepository stationRepository,
            IStationGenerator<TagsStationDefinition> stationGenerator)
        {
            _stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
            _stationGenerator  = stationGenerator ?? throw new ArgumentNullException(nameof(stationGenerator));
        }

        [HttpPost]
        [Route("{tag}")]

        public async Task<IActionResult> Create(string tag)
        {
            if (string.IsNullOrWhiteSpace(tag))
                throw new ArgumentException("Value cannot be null or whitespace.", nameof(tag));

            var station = new Station<TagsStationDefinition>
                { Definition = new TagsStationDefinition(new[] { tag }), Id = Guid.NewGuid() };

            _stationRepository.Create(station);

            await _stationGenerator.Generate(station);

            return Json(station);
        }
    }
}