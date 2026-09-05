using Gantry.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gantry.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Todo> Todos => Set<Todo>();
    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<ProjectEnvironment> Environments => Set<ProjectEnvironment>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Win> Wins => Set<Win>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<AppSettings> AppSettings => Set<AppSettings>();
    public DbSet<DailyQuote> DailyQuotes => Set<DailyQuote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Settings).HasColumnType("jsonb");
            entity.Property(e => e.Status)
                .HasConversion<string>()
                .HasDefaultValue(ProjectStatus.Active);
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.HasOne(e => e.ParentProject)
                .WithMany(e => e.ChildProjects)
                .HasForeignKey(e => e.ParentProjectId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Todo>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Status)
                .HasConversion<string>()
                .HasDefaultValue(TodoStatus.Todo);
            entity.Property(e => e.Priority)
                .HasConversion<string>()
                .HasDefaultValue(Priority.Medium)
                .HasSentinel(Priority.Low);

            entity.Property(e => e.CompletedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.DeletedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Resource>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Location).IsRequired();
            entity.Property(e => e.Type)
                .HasConversion<string>()
                .HasDefaultValue(ResourceType.Website);
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Environment)
                .WithMany(e => e.Resources)
                .HasForeignKey(e => e.EnvironmentId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).HasDefaultValue(string.Empty);
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.DeletedUtc).HasColumnType("timestamptz");
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Content).HasDefaultValue(string.Empty);
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.DeletedUtc).HasColumnType("timestamptz");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tags).WithMany()
            .UsingEntity<Dictionary<string, object>>("ProjectTags",
                r => r.HasOne<Tag>().WithMany().HasForeignKey("TagId").OnDelete(DeleteBehavior.Cascade),
                l => l.HasOne<Project>().WithMany().HasForeignKey("ProjectId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Todo>()
            .HasMany(t => t.Tags).WithMany()
            .UsingEntity<Dictionary<string, object>>("TodoTags",
                r => r.HasOne<Tag>().WithMany().HasForeignKey("TagId").OnDelete(DeleteBehavior.Cascade),
                l => l.HasOne<Todo>().WithMany().HasForeignKey("TodoId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Note>()
            .HasMany(n => n.Tags).WithMany()
            .UsingEntity<Dictionary<string, object>>("NoteTags",
                r => r.HasOne<Tag>().WithMany().HasForeignKey("TagId").OnDelete(DeleteBehavior.Cascade),
                l => l.HasOne<Note>().WithMany().HasForeignKey("NoteId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Resource>()
            .HasMany(r => r.Tags).WithMany()
            .UsingEntity<Dictionary<string, object>>("ResourceTags",
                r => r.HasOne<Tag>().WithMany().HasForeignKey("TagId").OnDelete(DeleteBehavior.Cascade),
                l => l.HasOne<Resource>().WithMany().HasForeignKey("ResourceId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Win>()
            .HasMany(w => w.Tags).WithMany()
            .UsingEntity<Dictionary<string, object>>("WinTags",
                r => r.HasOne<Tag>().WithMany().HasForeignKey("TagId").OnDelete(DeleteBehavior.Cascade),
                l => l.HasOne<Win>().WithMany().HasForeignKey("WinId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Article>()
            .HasMany(a => a.Tags).WithMany()
            .UsingEntity<Dictionary<string, object>>("ArticleTags",
                r => r.HasOne<Tag>().WithMany().HasForeignKey("TagId").OnDelete(DeleteBehavior.Cascade),
                l => l.HasOne<Article>().WithMany().HasForeignKey("ArticleId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Win>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Date).HasColumnType("date");
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.DeletedUtc).HasColumnType("timestamptz");
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AppSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DisplayName).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(320);
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.LockEnabled).HasDefaultValue(true);
            entity.Property(e => e.IdleTimeoutMinutes).HasDefaultValue(5);
            entity.Property(e => e.PinHash).HasMaxLength(200);
            entity.Property(e => e.PinSalt).HasMaxLength(200);
        });

        modelBuilder.Entity<DailyQuote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quote).IsRequired();
            entity.Property(e => e.Author).IsRequired();
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.HasIndex(e => e.Date).IsUnique();
        });

        modelBuilder.Entity<ProjectEnvironment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("Environments");
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.CreatedUtc).HasColumnType("timestamptz");
            entity.Property(e => e.UpdatedUtc).HasColumnType("timestamptz");
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
