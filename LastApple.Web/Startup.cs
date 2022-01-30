using System.Net.Http;
using AppleMusicApi;
using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Objects;
using IF.Lastfm.Core.Scrobblers;
using LastApple.Persistence;
using LastApple.PlaylistGeneration;
using LastApple.Web.Extensions;
using LastApple.Web.Lastfm;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace LastApple.Web;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public const string AllowCorsPolicy = "AllowCorsPolicy";

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(AllowCorsPolicy,
                              builder =>
                              {
                                  builder.SetIsOriginAllowed(_ => true)
                                         .AllowCredentials()
                                         .AllowAnyHeader()
                                         .AllowAnyMethod();
                              });
        });
        services.AddRazorPages();

        // In production, the React files will be served from this directory
        services.AddSpaStaticFiles(configuration =>
        {
            configuration.RootPath = "ClientApp/build";
        });

        services.AddOptions();

        services.Configure<AppCredentials>(Configuration.GetSection("AppleAppCredentials"));
        services.Configure<LastfmApiParams>(Configuration.GetSection("Lastfm"));

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
        services.AddScoped<IStorefrontProvider, StorefrontProvider>();
        services.AddScoped<ITrackIdProvider, TrackIdProvider>();
        services.AddTransient<IRandomizer, Randomizer>();
        services.AddTransient<ICatalogApi, CatalogApi>();

        services.AddTransient(container =>
        {
            var tokenProvider = container.GetService<IDeveloperTokenProvider>();

            return new ApiAuthentication { DeveloperToken = tokenProvider.GetToken() };
        });

        services.AddScoped(c =>
        {
            var apiParams = c.GetService<IOptions<LastfmApiParams>>();

            return new LastfmClient(apiParams.Value.ApiKey, apiParams.Value.Secret, new HttpClient());
        });

        services.AddScoped(c =>
        {
            var lastAuth = c.GetService<LastfmClient>().Auth;

            lastAuth.LoadSession(new LastUserSession());

            return lastAuth;
        });

        services.AddScoped<IUserApi>(c => c.GetService<LastfmClient>().User);
        services.AddScoped<IScrobbler>(c => c.GetService<LastfmClient>().Scrobbler);
        services.AddScoped<ITrackApi>(c => c.GetService<LastfmClient>().Track);
        services.AddScoped<IArtistApi>(c => c.GetService<LastfmClient>().Artist);
        services.AddScoped<ITagApi>(c => c.GetService<LastfmClient>().Tag);

        services.AddScoped<IStationSource<ArtistsStationDefinition>, ArtistsStationSource>();
        services.AddScoped<IStationSource<SimilarArtistsStationDefinition>, SimilarArtistsStationSource>();
        services.AddScoped<IStationSource<TagsStationDefinition>, TagsStationSource>();
        services.AddScoped<IStationSource<LastfmLibraryStationDefinition>, LastfmLibraryStationSource>();

        services.Decorate<IStationSource<ArtistsStationDefinition>, CachingStationSource<ArtistsStationDefinition>>();
        services.Decorate<IStationSource<SimilarArtistsStationDefinition>, CachingStationSource<SimilarArtistsStationDefinition>>();
        services.Decorate<IStationSource<TagsStationDefinition>, CachingStationSource<TagsStationDefinition>>();
        services.Decorate<IStationSource<LastfmLibraryStationDefinition>, CachingStationSource<LastfmLibraryStationDefinition>>();

        services.AddSingleton<ISessionRepository, SessionRepository>();

        services.AddHttpContextAccessor();

        services.AddScoped<ISessionProvider, SessionProvider>();

        services.AddSingleton<IStationRepository, StationRepository>();
        services.AddSingleton<IStationEventMediator, SignalrStationEventMediator>();
        services.AddSingleton<IBackgroundProcessManager, BackgroundProcessManager>();
        services.AddSingleton(container => (IHostedService)container.GetService<IBackgroundProcessManager>());
        services.AddScoped<ITrackRepository, TrackRepository>();

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

        app.UseCors(AllowCorsPolicy);

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