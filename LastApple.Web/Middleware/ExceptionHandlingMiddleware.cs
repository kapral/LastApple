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
            await HandleHttpExceptionAsync(context, httpException);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "An unexpected error occurred: {Message}", exception.Message);
            await HandleGenericExceptionAsync(context, exception);
        }
    }

    private static async Task HandleHttpExceptionAsync(HttpContext context, HttpException httpException)
    {
        context.Response.StatusCode = (int)httpException.StatusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = httpException.Message,
            statusCode = (int)httpException.StatusCode
        };

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }

    private static async Task HandleGenericExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = "An internal server error occurred.",
            statusCode = (int)HttpStatusCode.InternalServerError
        };

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
}