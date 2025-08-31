using System;
using System.Net;
using System.Net.Http;

namespace AppleMusicApi;

public class ApiException(HttpMethod method, string url, HttpStatusCode httpStatusCode)
    : Exception($"API request {method} {url} failed with status {httpStatusCode}")
{
    public HttpStatusCode HttpStatusCode { get; } = httpStatusCode;
}