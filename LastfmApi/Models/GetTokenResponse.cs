using System;

namespace LastfmApi.Api {
    public class GetTokenResponse {
        public GetTokenResponse(string token) {
            Token = token ?? throw new ArgumentNullException(nameof(token));
        }

        public string Token { get; } 
    }
}