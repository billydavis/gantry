using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Todos.Mcp;

[McpServerToolType]
public class TodoMcpTools
{
    [McpServerTool(Name = "create_todo"), Description("Creates a new todo.")]
    public static async Task<TodoResponse> CreateTodo(
        Create.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<TodoResponse>(await Create.Endpoint.Handle(request, db, ct));

    [McpServerTool(Name = "update_todo"), Description("Updates an existing todo's fields, including status and priority.")]
    public static async Task<TodoResponse> UpdateTodo(
        [Description("The todo's id.")] Guid id,
        Update.Request request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<TodoResponse>(await Update.Endpoint.Handle(id, request, db, ct));

    [McpServerTool(Name = "list_todos"), Description("Lists todos, sorted by pinned/due-date/priority. Excludes soft-deleted todos, and completed ones unless includeCompleted is set.")]
    public static async Task<IEnumerable<TodoResponse>> ListTodos(
        AppDbContext db,
        CancellationToken ct,
        [Description("Filter to a single project.")] Guid? projectId = null,
        [Description("Filter to a status: Todo, InProgress, Complete.")] string? status = null,
        [Description("Include completed todos in the results.")] bool includeCompleted = false)
        => McpResultAdapter.Unwrap<IEnumerable<TodoResponse>>(
            await List.Endpoint.Handle(db, ct, projectId, status, includeCompleted));

    [McpServerTool(Name = "get_todo"), Description("Gets a single todo by id.")]
    public static async Task<TodoResponse> GetTodo(
        [Description("The todo's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<TodoResponse>(await GetById.Endpoint.Handle(id, db, ct));

    [McpServerTool(Name = "complete_todo"), Description("Marks a todo complete. Reversible via reopen_todo.")]
    public static async Task<TodoResponse> CompleteTodo(
        [Description("The todo's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<TodoResponse>(await Complete.Endpoint.Handle(id, db, ct));

    [McpServerTool(Name = "reopen_todo"), Description("Reopens a completed todo back to Todo status.")]
    public static async Task<TodoResponse> ReopenTodo(
        [Description("The todo's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<TodoResponse>(await Reopen.Endpoint.Handle(id, db, ct));

    [McpServerTool(Name = "pin_todo"), Description("Toggles whether a todo is pinned to the top of the list.")]
    public static async Task<TodoResponse> PinTodo(
        [Description("The todo's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<TodoResponse>(await Pin.Endpoint.Handle(id, db, ct));

    [McpServerTool(Name = "soft_delete_todo"), Description("Soft-deletes a todo (sets a deleted timestamp; it is hidden from lists but not permanently removed from the database).")]
    public static async Task<string> SoftDeleteTodo(
        [Description("The todo's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.UnwrapNoContent(await Delete.Endpoint.Handle(id, db, ct));
}
