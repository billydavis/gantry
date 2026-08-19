namespace Gantry.Api.Features.AppSettings;

public static class AppSettingsEndpoints
{
    public static IEndpointRouteBuilder MapAppSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        Get.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        SetPin.Endpoint.Map(app);
        ChangePin.Endpoint.Map(app);
        ClearPin.Endpoint.Map(app);
        VerifyPin.Endpoint.Map(app);
        return app;
    }
}
