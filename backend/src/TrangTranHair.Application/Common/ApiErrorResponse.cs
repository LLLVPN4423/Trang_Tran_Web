namespace TrangTranHair.Application.Common;

public sealed record ApiErrorResponse(
    int StatusCode,
    string Message,
    string? TraceId = null,
    IDictionary<string, string[]>? Errors = null);
