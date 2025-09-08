using System;
using System.Net;

namespace LastApple.Web.Exceptions;

public abstract class HttpException(string message, HttpStatusCode statusCode) : Exception(message)
{
    public HttpStatusCode StatusCode { get; } = statusCode;
}