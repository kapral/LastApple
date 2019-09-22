using System;
using AppleMusicApi;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastfmApi;
using LastfmPlayer.Core.PlaylistGeneration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

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
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

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
            services.AddScoped<ISessionKey>(x =>
            {
                var sessionProvider = x.GetService<ISessionProvider>();

                return new SessionKey(sessionProvider.Session?.LastfmSessionKey);
            });

            services.AddHttpContextAccessor();

            services.AddScoped<ISessionProvider>(context =>
            {
                var contextAccessor   = context.GetService<IHttpContextAccessor>();
                var sessionRepository = context.GetService<ISessionRepository>();

                var sessionId = contextAccessor.HttpContext.Request.Headers["X-SessionId"];

                if (!Guid.TryParse(sessionId, out var id))
                    return new SessionProvider(null);

                return new SessionProvider(sessionRepository.GetSession(id));
            });

            services.AddSingleton<IStationRepository, StationRepository>();
            services.AddSingleton<IStationEventMediator, SignalrStationEventMediator>();
            services.AddSingleton<IBackgroundProcessManager, BackgroundProcessManager>();
            services.AddSingleton(container => (IHostedService)container.GetService<IBackgroundProcessManager>());
            services.AddSingleton<ILastfmCache, LastfmCache>();
            services.AddSignalR();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
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

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSignalR(routes =>
            {
                routes.MapHub<StationHub>("/hubs");
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
