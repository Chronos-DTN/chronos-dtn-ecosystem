// Por que: Importa o namespace do Entity Framework Core para gerenciamento de ORM e banco de dados.
using Microsoft.EntityFrameworkCore;
// Por que: Importa os modelos de domínio do ChronosDTN para que possam ser mapeados em DbSet.
using ChronosDtnNetApi.Models;

// Por que: Define o namespace do diretório Data para organizar as classes de persistência.
namespace ChronosDtnNetApi.Data;

// Por que: Classe que representa a ponte entre os modelos orientados a objetos e a base de dados de simulação espacial.
public class ChronosDbContext : DbContext
{
    // Por que: Permite que o ASP.NET Core passe as configurações de banco (como InMemory) via injeção de dependência.
    public ChronosDbContext(DbContextOptions<ChronosDbContext> options) : base(options)
    {
        // Por que: O construtor apenas delega as opções à classe base do DbContext.
    }

    // Por que: Expõe a tabela de nós de rede no banco, permitindo consultas e persistência das estações.
    public DbSet<Node> Nodes => Set<Node>();

    // Por que: Expõe a tabela de links (enlaces de comunicação) para verificação de janelas e banda.
    public DbSet<Link> Links => Set<Link>();

    // Por que: Expõe a tabela de contas financeiras das colônias lunares e estações terrenas.
    public DbSet<Account> Accounts => Set<Account>();

    // Por que: Expõe a fila de buffers Store-and-Forward do protocolo DTN.
    public DbSet<Bundle> Bundles => Set<Bundle>();

    // Por que: Expõe a tabela de transações financeiras encapsuladas que trafegam entre os planetas.
    public DbSet<Transaction> Transactions => Set<Transaction>();

    // Por que: Expõe os logs de sincronização e reconciliação operacional de rede para fins de auditoria.
    public DbSet<SyncLog> SyncLogs => Set<SyncLog>();

    // Por que: Sobrescreve OnModelCreating para definir mapeamentos customizados do ORM usando Fluent API.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Por que: Chama o método da classe base para manter o comportamento padrão do EF Core.
        base.OnModelCreating(modelBuilder);

        // Por que: Configura a chave composta do Bundle (SourceNodeId, LocalSequenceId) essencial para evitar colisões na rede espacial.
        modelBuilder.Entity<Bundle>()
            .HasKey(b => new { b.SourceNodeId, b.LocalSequenceId });

        // Por que: Mapeia o relacionamento de muitos Bundles enviados a partir de um Node emissor específico.
        modelBuilder.Entity<Bundle>()
            .HasOne(b => b.SourceNode)
            .WithMany()
            .HasForeignKey(b => b.SourceNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Por que: Mapeia o relacionamento de muitos Bundles endereçados a um Node destinatário específico.
        modelBuilder.Entity<Bundle>()
            .HasOne(b => b.DestNode)
            .WithMany()
            .HasForeignKey(b => b.DestNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Por que: Mapeia o nó de origem no Link, garantindo integridade referencial.
        modelBuilder.Entity<Link>()
            .HasOne(l => l.SourceNode)
            .WithMany()
            .HasForeignKey(l => l.SourceNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Por que: Mapeia o nó de destino no Link, impedindo exclusão acidental de nós referenciados.
        modelBuilder.Entity<Link>()
            .HasOne(l => l.DestNode)
            .WithMany()
            .HasForeignKey(l => l.DestNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Por que: Associa a conta bancária ao nó em que ela está hospedada localmente.
        modelBuilder.Entity<Account>()
            .HasOne(a => a.Node)
            .WithMany()
            .HasForeignKey(a => a.NodeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Por que: Garante a precisão decimal necessária para saldos de contas na economia espacial (15 dígitos, 2 decimais).
        modelBuilder.Entity<Account>()
            .Property(a => a.Balance)
            .HasPrecision(15, 2);

        // Por que: Garante a precisão decimal das transações de transferência de créditos entre planetas.
        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(15, 2);
    }
}
