using System;
using System.Threading.Tasks;

namespace LastApple
{
    public interface IBackgroundProcessManager
    {
        void AddProcess(Func<Task> process);
    }
}