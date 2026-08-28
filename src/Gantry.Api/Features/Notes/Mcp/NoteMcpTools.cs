using System.ComponentModel;
using Gantry.Api.Data;
using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Notes.Create;
using Gantry.Api.Features.Notes.Update;
using ModelContextProtocol.Server;

namespace Gantry.Api.Features.Notes.Mcp;

[McpServerToolType]
public class NoteMcpTools
{
    [McpServerTool(Name = "create_note"), Description("Creates a new note.")]
    public static async Task<NoteResponse> CreateNote(
        CreateNoteRequest request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<NoteResponse>(await Create.Endpoint.Handle(request, db, ct));

    [McpServerTool(Name = "update_note"), Description("Updates an existing note's project, title, or content.")]
    public static async Task<NoteResponse> UpdateNote(
        [Description("The note's id.")] Guid id,
        UpdateNoteRequest request, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<NoteResponse>(await Update.Endpoint.Handle(id, request, db, ct));

    [McpServerTool(Name = "list_notes"), Description("Lists notes, most recently updated first.")]
    public static async Task<IEnumerable<NoteResponse>> ListNotes(
        AppDbContext db,
        CancellationToken ct,
        [Description("Filter to a single project.")] Guid? projectId = null,
        [Description("Filter to notes carrying this tag.")] Guid? tagId = null,
        [Description("Case-insensitive text to match against note title, content, or tag names (min 2 characters).")] string? q = null,
        [Description("Maximum number of notes to return.")] int? limit = null)
        => McpResultAdapter.Unwrap<IEnumerable<NoteResponse>>(
            await List.Endpoint.Handle(db, ct, projectId, tagId, q, skip: null, take: null, limit: limit));

    [McpServerTool(Name = "get_note"), Description("Gets a single note by id.")]
    public static async Task<NoteResponse> GetNote(
        [Description("The note's id.")] Guid id, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<NoteResponse>(await GetById.Endpoint.Handle(db, id, ct));

    [McpServerTool(Name = "get_or_create_daily_note"), Description("Gets the daily journal note for a date, creating it from the daily template if it doesn't exist yet.")]
    public static async Task<NoteResponse> GetOrCreateDailyNote(
        [Description("Date in yyyy-MM-dd format.")] string date, AppDbContext db, CancellationToken ct)
        => McpResultAdapter.Unwrap<NoteResponse>(await GetOrCreateDaily.Endpoint.Handle(db, date, ct));
}
