namespace Gantry.Api.Features.AppSettings;

public static class AppSettingsEndpoints
{
    public static IEndpointRouteBuilder MapAppSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        Get.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        return app;
    }
}
