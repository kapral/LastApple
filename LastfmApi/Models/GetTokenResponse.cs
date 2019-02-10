using System;

namespace LastfmApi.Models {
    public class GetTokenResponse {
        public GetTokenResponse(string token) {
            Token = token ?? throw new ArgumentNullException(nameof(token));
        }

        public string Token { get; } 
    }
}