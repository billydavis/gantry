using Gantry.Api.Data;
using Gantry.Api.Data.Entities;

namespace Gantry.Api.Tests.Support;

/// <summary>Entity-building helpers for Tags tests.</summary>
public static class TagFactory
{
    public static async Task<Tag> CreateTagAsync(AppDbContext db, string name = "Test Tag", string? color = null)
    {
        var tag = new Tag { Id = Guid.NewGuid(), Name = name, Color = color };
        db.Tags.Add(tag);
        await db.SaveChangesAsync();
        return tag;
    }

    public static async Task AssignToProjectAsync(AppDbContext db, Project project, Tag tag)
    {
        project.Tags.Add(tag);
        await db.SaveChangesAsync();
    }

    public static async Task AssignToTodoAsync(AppDbContext db, Todo todo, Tag tag)
    {
        todo.Tags.Add(tag);
        await db.SaveChangesAsync();
    }

    public static async Task AssignToNoteAsync(AppDbContext db, Note note, Tag tag)
    {
        note.Tags.Add(tag);
        await db.SaveChangesAsync();
    }

    public static async Task AssignToResourceAsync(AppDbContext db, Resource resource, Tag tag)
    {
        resource.Tags.Add(tag);
        await db.SaveChangesAsync();
    }

    public static async Task AssignToWinAsync(AppDbContext db, Win win, Tag tag)
    {
        win.Tags.Add(tag);
        await db.SaveChangesAsync();
    }

    public static async Task AssignToArticleAsync(AppDbContext db, Article article, Tag tag)
    {
        article.Tags.Add(tag);
        await db.SaveChangesAsync();
    }
}
