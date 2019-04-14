using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace LastApple.Web
{
    public class BackgroundProcessManager : BackgroundService, IBackgroundProcessManager
    {
        private readonly object _syncContext = new object();
        private readonly IList<Func<Task>> _pendingProcesses = new List<Func<Task>>();

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
                    _ = Task.Run(factory, stoppingToken);

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
}