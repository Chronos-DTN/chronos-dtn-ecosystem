// Por que: Importa as bibliotecas básicas do .NET para coleções, data/hora e manipulação.
using System;
using System.Collections.Generic;
using System.Linq;
// Por que: Importa o EF Core para carregamento adiantado (Include) e consultas.
using Microsoft.EntityFrameworkCore;
// Por que: Importa os modelos de dados locais do ChronosDTN.
using ChronosDtnNetApi.Models;
// Por que: Importa as definições do banco de dados (DbContext).
using ChronosDtnNetApi.Data;

// Por que: Define o namespace do diretório de serviços da API.
namespace ChronosDtnNetApi.Services;

// Por que: Interface que expõe as funcionalidades de controle de pacotes e filas (Store-and-Forward) na rede espacial.
public interface IBundleService
{
    // Por que: Consulta todos os bundles retidos nas filas de transmissão da rede.
    IEnumerable<Bundle> GetAllBundles();

    // Por que: Obtém um pacote específico usando a chave composta (sourceNodeId e localSequenceId).
    Bundle GetBundleById(long sourceNodeId, long localSequenceId);

    // Por que: Adiciona e persiste um novo bundle no buffer.
    Bundle SaveBundle(Bundle bundle);

    // Por que: Dispara a simulação operacional de contato físico orbital e transmite pacotes pendentes.
    int TransmitPendingBundles();
}

// Por que: Implementa as regras de negócio de fila DTN e controle de links espaciais.
public class BundleService : IBundleService
{
    // Por que: Acesso ao contexto de banco de dados para ler/gravar estados físicos da simulação.
    private readonly ChronosDbContext _context;

    // Por que: Injeta o contexto de banco via construtor padrão.
    public BundleService(ChronosDbContext context)
    {
        // Por que: Inicializa o contexto privado de persistência.
        _context = context;
    }

    // Por que: Retorna a coleção completa de bundles indexada de forma relacional.
    public IEnumerable<Bundle> GetAllBundles()
    {
        // Por que: Retorna a lista completa incluindo referências aos nós.
        return _context.Bundles
            .Include(b => b.SourceNode)
            .Include(b => b.DestNode)
            .ToList();
    }

    // Por que: Retorna um bundle específico, disparando exceção detalhada em caso de não localização.
    public Bundle GetBundleById(long sourceNodeId, long localSequenceId)
    {
        // Por que: Busca o bundle com base na chave primária composta mapeada no EF Core.
        var bundle = _context.Bundles
            .Include(b => b.SourceNode)
            .Include(b => b.DestNode)
            .FirstOrDefault(b => b.SourceNodeId == sourceNodeId && b.LocalSequenceId == localSequenceId);

        // Por que: Lança exceção de não localizado se a busca retornar nula.
        if (bundle == null)
        {
            // Por que: Lança KeyNotFoundException para que seja tratada pelo middleware de erros.
            throw new KeyNotFoundException($"Bundle não localizado com ID {sourceNodeId}-{localSequenceId}");
        }

        // Por que: Retorna o objeto encontrado.
        return bundle;
    }

    // Por que: Grava fisicamente um bundle de dados na tabela de enfileiramento local.
    public Bundle SaveBundle(Bundle bundle)
    {
        // Por que: Adiciona o bundle ao conjunto gerenciado pelo contexto.
        _context.Bundles.Add(bundle);
        // Por que: Salva as alterações no banco de dados.
        _context.SaveChanges();
        // Por que: Retorna o objeto persistido.
        return bundle;
    }

    // Por que: Processa a lógica principal do Store-and-Forward: verifica contatos e despacha fila.
    public int TransmitPendingBundles()
    {
        // Por que: Captura o carimbo de data/hora atual da simulação espacial.
        var currentTime = DateTime.UtcNow;
        // Por que: Acumulador de quantidade de pacotes que viajaram pelo espaço nesta janela.
        int transmittedCount = 0;

        // Por que: Filtra no banco apenas os links ativos (UP) cuja janela de tempo cobre o instante atual.
        var activeLinks = _context.Links
            .Include(l => l.SourceNode)
            .Include(l => l.DestNode)
            .Where(l => l.Status == "UP" && currentTime >= l.StartTime && currentTime <= l.EndTime)
            .ToList();

        // Por que: Varre cada enlace de rádio espacial ativo disponível.
        foreach (var link in activeLinks)
        {
            // Por que: Filtra na fila Store-and-Forward os pacotes BUFFERED que saem do nó origem e chegam no nó destino deste link.
            var pendingBundles = _context.Bundles
                .Where(b => b.TransmissionStatus == "BUFFERED" && b.SourceNodeId == link.SourceNodeId && b.DestNodeId == link.DestNodeId)
                // Por que: Ordena por maior prioridade (2 = Alta) e depois por tempo de criação mais antigo (FIFO).
                .OrderByDescending(b => b.Priority)
                .ThenBy(b => b.CreatedTime)
                .ToList();

            // Por que: Se existirem pacotes na fila de envio do transmissor correspondente:
            if (pendingBundles.Any())
            {
                // Por que: Contador de pacotes despachados neste link específico.
                int countForLink = 0;

                // Por que: Itera processando cada pacote individualmente.
                foreach (var bundle in pendingBundles)
                {
                    // Por que: Altera o status para entregue (DELIVERED), simulando a chegada no destino orbital.
                    bundle.TransmissionStatus = "DELIVERED";
                    // Por que: Incrementa contadores de sucesso de transmissão.
                    countForLink++;
                    transmittedCount++;
                }

                // Por que: Gera o identificador sequencial incremental do próximo log.
                long newLogId = _context.SyncLogs.Count() + 1;

                // Por que: Cria o registro de auditoria de janela de contato.
                var syncLog = new SyncLog
                {
                    Id = newLogId,
                    LinkId = link.Id,
                    Link = link,
                    SyncTime = currentTime,
                    BundlesSent = countForLink,
                    Errors = 0, // Por que: Simula canal de rádio sem ruídos físicos.
                    Status = "SUCCESS"
                };

                // Por que: Persiste o log no banco de dados.
                _context.SyncLogs.Add(syncLog);
            }
        }

        // Por que: Salva todas as alterações pendentes em uma única transação atômica de banco.
        _context.SaveChanges();

        // Por que: Retorna o total de pacotes enviados com sucesso.
        return transmittedCount;
    }
}
