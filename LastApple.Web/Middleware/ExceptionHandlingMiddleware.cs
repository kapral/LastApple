using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using LastApple.Web.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace LastApple.Web.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (HttpException httpException)
        {
            logger.LogWarning(httpException, "HTTP exception occurred: {Message}", httpException.Message);
            await HandleException(context, httpException.StatusCode, httpException.Message);;
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "An unexpected error occurred: {Message}", exception.Message);
            await HandleException(context, HttpStatusCode.InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task HandleException(HttpContext context, HttpStatusCode statusCode, string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = message,
            statusCode = (int)statusCode
        };

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
}