using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LastApple.Web;

public class BackgroundProcessManager : BackgroundService, IBackgroundProcessManager
{
    private readonly object _syncContext = new object();
    private readonly IList<Func<Task>> _pendingProcesses = new List<Func<Task>>();
    private readonly ILogger<BackgroundProcessManager> _logger;

    public BackgroundProcessManager(ILogger<BackgroundProcessManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            IEnumerable<Func<Task>> toRun;

            lock (_syncContext)
            {
                toRun = _pendingProcesses.ToList();
                _pendingProcesses.Clear();
            }

            foreach (var factory in toRun)
                _ = Task.Run(factory, stoppingToken).ContinueWith((t,
                                                                   _) =>
                {
                    if (t.Exception != null)
                        _logger.LogError(t.Exception, "Background process failed");
                }, null, stoppingToken);

            await Task.Delay(TimeSpan.FromMilliseconds(500), stoppingToken);
        }
    }

    public void AddProcess(Func<Task> process)
    {
        lock (_syncContext)
        {
            _pendingProcesses.Add(process);
        }
    }
}