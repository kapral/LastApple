using System;

namespace LastfmApi.Api {
    public class Session {
        public Session(string name, string key) {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Key = key ?? throw new ArgumentNullException(nameof(key));
        }

        public string Name { get; }

        public string Key { get; }
    }
}