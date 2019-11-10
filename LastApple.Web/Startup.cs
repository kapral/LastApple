using AppleMusicApi;
using LastApple.Persistence;
using LastApple.PlaylistGeneration;
using LastApple.Web.Extensions;
using LastfmApi;
using LastfmPlayer.Core.PlaylistGeneration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace LastApple.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            services.AddOptions();

            services.Configure<AppCredentials>(Configuration.GetSection("AppleAppCredentials"));

            services.AddTransient<IDeveloperTokenGenerator, DeveloperTokenGenerator>();
            services.AddSingleton<IDeveloperTokenProvider, DeveloperTokenProvider>();

            services.AddScoped<IStationGenerator<ArtistsStationDefinition>, StationGenerator<ArtistsStationDefinition>>();
            services.AddScoped<IStationGenerator<SimilarArtistsStationDefinition>, StationGenerator<SimilarArtistsStationDefinition>>();
            services.AddScoped<IStationGenerator<TagsStationDefinition>, StationGenerator<TagsStationDefinition>>();
            services.AddScoped<IStationGenerator<LastfmLibraryStationDefinition>, StationGenerator<LastfmLibraryStationDefinition>>();
            services.AddScoped<IStationTrackGenerator<ArtistsStationDefinition>, StationTrackGenerator<ArtistsStationDefinition>>();
            services.AddScoped<IStationTrackGenerator<SimilarArtistsStationDefinition>, StationTrackGenerator<SimilarArtistsStationDefinition>>();
            services.AddScoped<IStationTrackGenerator<TagsStationDefinition>, StationTrackGenerator<TagsStationDefinition>>();
            services.AddScoped<IStationTrackGenerator<LastfmLibraryStationDefinition>, StationTrackGenerator<LastfmLibraryStationDefinition>>();
            services.AddTransient<ITrackIdProvider, TrackIdProvider>();
            services.AddTransient<IRandomizer, Randomizer>();
            services.AddTransient<ICatalogApi, CatalogApi>();

            services.AddTransient(container =>
            {
                var tokenProvider = container.GetService<IDeveloperTokenProvider>();

                return new ApiAuthentication { DeveloperToken = tokenProvider.GetToken() };
            });

            services.AddScoped<IStationSource<ArtistsStationDefinition>, ArtistsStationSource>();
            services.AddScoped<IStationSource<SimilarArtistsStationDefinition>, SimilarArtistsStationSource>();
            services.AddScoped<IStationSource<TagsStationDefinition>, TagsStationSource>();
            services.AddScoped<IStationSource<LastfmLibraryStationDefinition>, LastfmLibraryStationSource>();

            services.AddSingleton<ISessionRepository, SessionRepository>();
            services.AddScoped<ILastfmApi, LastfmApi.LastfmApi>();

            services.AddHttpContextAccessor();

            services.AddScoped<ISessionProvider, SessionProvider>();
            services.AddScoped<ISessionKeyProvider, LastfmSessionKeyProvider>();

            services.AddSingleton<IStationRepository, StationRepository>();
            services.AddSingleton<IStationEventMediator, SignalrStationEventMediator>();
            services.AddSingleton<IBackgroundProcessManager, BackgroundProcessManager>();
            services.AddSingleton(container => (IHostedService)container.GetService<IBackgroundProcessManager>());
            services.AddSingleton<IStationDataCache, StationDataCache>();

            services.Configure<MongoConnectionDetails>(Configuration.GetSection("MongoDb"));

            services.AddPersistence();
            // needs to go after AddPersistence to register a decorator for already registered repository
            services.Decorate<ISessionRepository, CachingSessionRepository>();

            services.AddSignalR();


        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<StationHub>("/hubs");
                endpoints.MapControllerRoute("default", "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
