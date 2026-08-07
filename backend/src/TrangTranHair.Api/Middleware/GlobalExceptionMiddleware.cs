using System.Net;
using System.Text.Json;
using TrangTranHair.Application.Common;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Domain.Exceptions;

namespace TrangTranHair.Api.Middleware;

public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        var (statusCode, message, errors) = MapException(exception);

        if (statusCode >= (int)HttpStatusCode.InternalServerError)
            logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);
        else
            logger.LogWarning(exception, "Handled exception. TraceId: {TraceId}", traceId);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new ApiErrorResponse(statusCode, message, traceId, errors);
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private static (int StatusCode, string Message, IDictionary<string, string[]>? Errors) MapException(Exception exception)
    {
        return exception switch
        {
            ValidationException validation => (
                (int)HttpStatusCode.BadRequest,
                validation.Message,
                validation.Errors),
            DomainException domain => (
                (int)HttpStatusCode.BadRequest,
                domain.Message,
                null),
            NotFoundException notFound => (
                (int)HttpStatusCode.NotFound,
                notFound.Message,
                null),
            UnauthorizedAccessException => (
                (int)HttpStatusCode.Unauthorized,
                "Unauthorized access.",
                null),
            _ => (
                (int)HttpStatusCode.InternalServerError,
                "An unexpected error occurred. Please try again later.",
                null)
        };
    }
}
