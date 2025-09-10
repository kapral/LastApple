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
    private HttpContext mockHttpContext;
    private HttpResponse mockResponse;
    private MemoryStream responseStream;
    private ExceptionHandlingMiddleware middleware;

    [SetUp]
    public void Setup()
    {
        mockLogger = Substitute.For<ILogger<ExceptionHandlingMiddleware>>();
        mockNext = Substitute.For<RequestDelegate>();
        mockHttpContext = Substitute.For<HttpContext>();
        mockResponse = Substitute.For<HttpResponse>();
        responseStream = new MemoryStream();

        mockHttpContext.Response.Returns(mockResponse);
        mockResponse.Body.Returns(responseStream);

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
        await middleware.InvokeAsync(mockHttpContext);

        await mockNext.Received(1).Invoke(mockHttpContext);
    }

    [Test]
    public async Task InvokeAsync_NoException_DoesNotModifyResponse()
    {
        await middleware.InvokeAsync(mockHttpContext);

        mockResponse.DidNotReceiveWithAnyArgs().StatusCode = default;
        mockResponse.DidNotReceiveWithAnyArgs().ContentType = default;
    }

    [Test]
    public async Task InvokeAsync_HttpException_LogsWarning()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        mockLogger.Received(1).LogWarning(exception, "HTTP exception occurred: {Message}", "Test bad request");
    }

    [Test]
    public async Task InvokeAsync_HttpException_SetsCorrectStatusCode()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        mockResponse.Received(1).StatusCode = (int)HttpStatusCode.BadRequest;
    }

    [Test]
    public async Task InvokeAsync_HttpException_SetsJsonContentType()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        mockResponse.Received(1).ContentType = "application/json";
    }

    [Test]
    public async Task InvokeAsync_HttpException_WritesCorrectJsonResponse()
    {
        var exception = new BadRequestException("Test bad request");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("Test bad request"));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(400));
    }

    [Test]
    public async Task InvokeAsync_UnauthorizedException_ReturnsUnauthorizedResponse()
    {
        var exception = new UnauthorizedException("Test unauthorized");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        mockResponse.Received(1).StatusCode = (int)HttpStatusCode.Unauthorized;
        
        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("Test unauthorized"));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(401));
    }

    [Test]
    public async Task InvokeAsync_NotFoundException_ReturnsNotFoundResponse()
    {
        var exception = new NotFoundException("Test not found");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        mockResponse.Received(1).StatusCode = (int)HttpStatusCode.NotFound;
        
        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("Test not found"));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(404));
    }

    [Test]
    public async Task InvokeAsync_GeneralException_LogsError()
    {
        var exception = new InvalidOperationException("Test general exception");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        mockLogger.Received(1).LogError(exception, "An unexpected error occurred: {Message}", "Test general exception");
    }

    [Test]
    public async Task InvokeAsync_GeneralException_ReturnsInternalServerError()
    {
        var exception = new InvalidOperationException("Test general exception");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        mockResponse.Received(1).StatusCode = (int)HttpStatusCode.InternalServerError;
        mockResponse.Received(1).ContentType = "application/json";
    }

    [Test]
    public async Task InvokeAsync_GeneralException_WritesGenericErrorMessage()
    {
        var exception = new InvalidOperationException("Test general exception");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("An unexpected error occurred."));
        Assert.That(response.GetProperty("statusCode").GetInt32(), Is.EqualTo(500));
    }

    [Test]
    public async Task InvokeAsync_GeneralException_DoesNotExposeOriginalMessage()
    {
        var exception = new InvalidOperationException("Sensitive internal error details");
        mockNext.When(x => x.Invoke(mockHttpContext)).Do(_ => throw exception);

        await middleware.InvokeAsync(mockHttpContext);

        var responseContent = Encoding.UTF8.GetString(responseStream.ToArray());
        var response = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        Assert.That(response.GetProperty("error").GetString(), Is.Not.EqualTo("Sensitive internal error details"));
        Assert.That(response.GetProperty("error").GetString(), Is.EqualTo("An unexpected error occurred."));
    }
}