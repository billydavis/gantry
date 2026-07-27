namespace Gantry.Api.Features.Notes;

public static class NoteEndpoints
{
    public static IEndpointRouteBuilder MapNoteEndpoints(this IEndpointRouteBuilder app)
    {
        List.Endpoint.Map(app);
        GetOrCreateDaily.Endpoint.Map(app);
        GetOrCreateScratchPad.Endpoint.Map(app);
        GetById.Endpoint.Map(app);
        Create.Endpoint.Map(app);
        Update.Endpoint.Map(app);
        Delete.Endpoint.Map(app);
        return app;
    }
}
