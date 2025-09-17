using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using LastApple.Web.Exceptions;
using LastApple.Web.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace LastApple.Web.Tests;

public class TestExceptionHandlingMiddleware
{
    private ILogger<ExceptionHandlingMiddleware> mockLogger;
    private RequestDelegate mockNext;
    private DefaultHttpContext httpContext;
    private MemoryStream responseStream;
    private ExceptionHandlingMiddleware middleware;

    [SetUp]
    public void Setup()
    {
        mockLogger     = Substitute.For<ILogger<ExceptionHandlingMiddleware>>();
        mockNext       = Substitute.For<RequestDelegate>();
        responseStream = new MemoryStream();

        httpContext = new DefaultHttpContext
        {
            Response =
            {
                Body = responseStream
            }
        };

        middleware = new ExceptionHandlingMiddleware(mockNext, mockLogger);
    }

    [TearDown]
    public void TearDown()
    {
        responseStream?.Dispose();
    }

    [Test]
    public async Task InvokeAsync_NoException_CallsNextMiddleware()
    {
        await middleware.InvokeAsync(httpContext);

        await mockNext.Received(1).Invoke(httpContext);
    }

    [Test]
    public async Task InvokeAsync_NoException_DoesNotModifyResponse()
    {
        var originalStatusCode = httpContext.Response.StatusCode;
        var originalContentType = httpContext.Response.ContentType;

        await middleware.InvokeAsync(httpContext);

        Assert.That(httpContext.Response.StatusCode, Is.EqualTo(originalStatusCode));
        Assert.That(httpContext.Response.ContentType, Is.EqualTo(originalContentType));
    }

    [Test]
    public async Task InvokeAsync_HttpException_LogsWarning()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        // Verify that LogWarning was called with the expected parameters
        mockLogger.Received(1).Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString().Contains("HTTP exception occurred: Test bad request")),
            exception,
            Arg.Any<Func<object, Exception, string>>());
    }

    [Test]
    public async Task InvokeAsync_HttpException_SetsCorrectStatusCode()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        Assert.That(httpContext.Response.StatusCode, Is.EqualTo((int)HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task InvokeAsync_HttpException_SetsJsonContentType()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        Assert.That(httpContext.Response.ContentType, Is.EqualTo("application/json"));
    }

    [Test]
    public async Task InvokeAsync_HttpException_WritesCorrectJsonResponse()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);

        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("Test bad request"));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(400));
    }

    [Test]
    public async Task InvokeAsync_UnauthorizedException_ReturnsUnauthorizedResponse()
    {
        var exception = new UnauthorizedException("Test unauthorized");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        Assert.That(httpContext.Response.StatusCode, Is.EqualTo((int)HttpStatusCode.Unauthorized));

        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);

        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("Test unauthorized"));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(401));
    }

    [Test]
    public async Task InvokeAsync_NotFoundException_ReturnsNotFoundResponse()
    {
        var exception = new NotFoundException("Test not found");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        Assert.That(httpContext.Response.StatusCode, Is.EqualTo((int)HttpStatusCode.NotFound));

        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);

        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("Test not found"));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(404));
    }

    [Test]
    public async Task InvokeAsync_GeneralException_LogsError()
    {
        var exception = new InvalidOperationException("Test general exception");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        // Verify that LogError was called with the expected parameters
        mockLogger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString().Contains("An unexpected error occurred: Test general exception")),
            exception,
            Arg.Any<Func<object, Exception, string>>());
    }

    [Test]
    public async Task InvokeAsync_GeneralException_ReturnsInternalServerError()
    {
        var exception = new InvalidOperationException("Test general exception");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        Assert.That(httpContext.Response.StatusCode, Is.EqualTo((int)HttpStatusCode.InternalServerError));
        Assert.That(httpContext.Response.ContentType, Is.EqualTo("application/json"));
    }

    [Test]
    public async Task InvokeAsync_GeneralException_WritesGenericErrorMessage()
    {
        var exception = new InvalidOperationException("Test general exception");
        mockNext.When(x => x.Invoke(httpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(httpContext);

        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);

        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("An unexpected error occurred."));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(500));
    }
}