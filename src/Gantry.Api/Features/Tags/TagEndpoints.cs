namespace Gantry.Api.Features.Tags;

public static class TagEndpoints
{
    public static IEndpointRouteBuilder MapTagEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/tags", List.Endpoint.Handle);
        app.MapPost("/api/tags", Create.Endpoint.Handle);
        app.MapPut("/api/tags/{id:guid}", Update.Endpoint.Handle);
        app.MapDelete("/api/tags/{id:guid}", Delete.Endpoint.Handle);

        app.MapPut("/api/projects/{id:guid}/tags", Assign.Endpoint.AssignToProject);
        app.MapPut("/api/todos/{id:guid}/tags", Assign.Endpoint.AssignToTodo);
        app.MapPut("/api/notes/{id:guid}/tags", Assign.Endpoint.AssignToNote);
        app.MapPut("/api/resources/{id:guid}/tags", Assign.Endpoint.AssignToResource);
        app.MapPut("/api/wins/{id:guid}/tags", Assign.Endpoint.AssignToWin);
        app.MapPut("/api/articles/{id:guid}/tags", Assign.Endpoint.AssignToArticle);

        return app;
    }
}
