using Gantry.Api.Data.Entities;
using Gantry.Api.Features.Mcp;
using Gantry.Api.Features.Projects.Mcp;
using Gantry.Api.Tests.Infrastructure;
using Gantry.Api.Tests.Support;
using ModelContextProtocol;
using Shouldly;
using Xunit;
using CreateRequest = Gantry.Api.Features.Projects.Create.Request;
using UpdateRequest = Gantry.Api.Features.Projects.Update.Request;

namespace Gantry.Api.Tests.Features.Projects.Mcp;

[Trait("Category", "Integration")]
public class ProjectMcpToolsTests(DatabaseFixture db) : DbContextTestBase(db)
{
    [Fact]
    public async Task CreateProject_Valid_ReturnsResponse()
    {
        await using var dbContext = CreateDbContext();

        var result = await ProjectMcpTools.CreateProject(
            new CreateRequest(null, "Gantry", null, null, null), dbContext, CancellationToken.None);

        result.Name.ShouldBe("Gantry");
    }

    [Fact]
    public async Task CreateProject_MissingName_ThrowsMcpToolValidationExceptionWithFieldMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpToolValidationException>(() => ProjectMcpTools.CreateProject(
            new CreateRequest(null, "", null, null, null), dbContext, CancellationToken.None));

        ex.Message.ShouldContain("Name:");
    }

    [Fact]
    public async Task GetProject_NotFound_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(
            () => ProjectMcpTools.GetProject(Guid.NewGuid(), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Project not found.");
    }

    [Fact]
    public async Task UpdateProject_UnknownId_ThrowsMcpExceptionWithMessage()
    {
        await using var dbContext = CreateDbContext();

        var ex = await Should.ThrowAsync<McpException>(() => ProjectMcpTools.UpdateProject(
            Guid.NewGuid(), new UpdateRequest(null, "Name", null, null, null), dbContext, CancellationToken.None));

        ex.Message.ShouldBe("Project not found.");
    }

    [Fact]
    public async Task ArchiveProject_Existing_SetsStatus()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext);

        var result = await ProjectMcpTools.ArchiveProject(project.Id, dbContext, CancellationToken.None);

        result.Status.ShouldBe("Archived");
    }

    [Fact]
    public async Task ReactivateProject_Existing_SetsStatus()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext, status: ProjectStatus.Archived);

        var result = await ProjectMcpTools.ReactivateProject(project.Id, dbContext, CancellationToken.None);

        result.Status.ShouldBe("Active");
    }

    [Fact]
    public async Task HoldProject_Existing_SetsStatus()
    {
        await using var dbContext = CreateDbContext();
        var project = await ProjectFactory.CreateProjectAsync(dbContext);

        var result = await ProjectMcpTools.HoldProject(project.Id, dbContext, CancellationToken.None);

        result.Status.ShouldBe("OnHold");
    }

    [Fact]
    public async Task ListProjects_ReturnsCreatedProject()
    {
        await using var dbContext = CreateDbContext();
        await ProjectFactory.CreateProjectAsync(dbContext, "Listed Project");

        var result = await ProjectMcpTools.ListProjects(dbContext, CancellationToken.None);

        result.ShouldContain(p => p.Name == "Listed Project");
    }
}
