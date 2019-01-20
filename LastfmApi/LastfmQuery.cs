using System;
using System.Linq;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;

namespace LastfmApi
{
    public class LastfmQuery
    {
        internal const string ApiKey = "888c80c73cfd34e8d205ec66d367996c";
        private const string Secret = "5c7ce4cad8d91479d6413f197a6cf956";
        private readonly bool _isAuthorizable;
        private readonly IDictionary<string, string> _parameters;

        private LastfmQuery(string method, bool isAuthorizable)
        {
            _parameters = new Dictionary<string, string>
            {
                ["api_key"] = ApiKey,
                ["format"]  = "json",
                ["method"]  = method
            };
            _isAuthorizable = isAuthorizable;
        }

        public string MakeSignature(bool ignoreFormat = true)
        {
            var signature = string.Join(string.Empty,
                                _parameters.Keys.Where(k => !ignoreFormat || !k.Equals("format")).OrderBy(x => x)
                                    .Select(x => x + _parameters[x])) + Secret;

            return BitConverter.ToString(MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(signature)))
                .Replace("-", string.Empty).ToLowerInvariant();
        }

        public static LastfmQuery Method(string method)
        {
            return new LastfmQuery(method, false);
        }

        public static LastfmQuery AuthorizableMethod(string method, string sessionKey)
        {
            return new LastfmQuery(method, true).AddParam("sk", sessionKey);
        }

        public static LastfmQuery GetToken()
        {
            return Method("auth.getToken");
        }

        public static LastfmQuery GetSession(string token)
        {
            return new LastfmQuery("auth.getSession", true).AddParam("token", token);
        }

        public LastfmQuery AddParam(string name, string value)
        {
            _parameters[name] = value;
            return this;
        }

        public string Build()
        {
            if (_isAuthorizable)
            {
                AddParam("api_sig", MakeSignature());
            }

            return QueryHelpers.AddQueryString(string.Empty, _parameters);
        }

        public FormUrlEncodedContent AsFormUrlEncodedContent()
        {
            if (_isAuthorizable)
            {
                AddParam("api_sig", MakeSignature());
            }

            var keyValuePairs = _parameters.Keys.Select(x => new KeyValuePair<string, string>(x, _parameters[x]));
            return new FormUrlEncodedContent(keyValuePairs);
        }
    }
}