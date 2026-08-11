using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using TrangTranHair.Api.Authorization;

namespace TrangTranHair.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddFirebaseAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var projectId = configuration["Firebase:ProjectId"];

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // Keep Firebase claim names (admin, sub, user_id) unchanged.
                options.MapInboundClaims = false;

                if (string.IsNullOrWhiteSpace(projectId))
                {
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            context.NoResult();
                            return Task.CompletedTask;
                        },
                    };
                }
                else
                {
                    options.Authority = $"https://securetoken.google.com/{projectId}";
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = $"https://securetoken.google.com/{projectId}",
                        ValidateAudience = true,
                        ValidAudience = projectId,
                        ValidateLifetime = true,
                    };
                }
            });

        services.AddSingleton<IAuthorizationHandler, AdminAuthorizationHandler>();

        services.AddAuthorizationBuilder()
            .AddPolicy("Admin", policy => policy.Requirements.Add(new AdminRequirement()));

        return services;
    }
}
