// Por que: Importa namespaces do sistema para coleções, criptografia, texto e globalização.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Globalization;
// Por que: Importa o EF Core para eager loading de relacionamentos aninhados.
using Microsoft.EntityFrameworkCore;
// Por que: Importa as definições do DbContext local do ChronosDTN.
using ChronosDtnNetApi.Data;
// Por que: Importa os modelos de domínio do banco de dados.
using ChronosDtnNetApi.Models;
// Por que: Importa as definições de DTO de request e response.
using ChronosDtnNetApi.DTOs;
// Por que: Importa as exceções customizadas de negócio.
using ChronosDtnNetApi.Exceptions;

// Por que: Organiza as classes de serviço sob o namespace Services.
namespace ChronosDtnNetApi.Services;

// Por que: Contrato de serviço para orquestração de transações financeiras e pacotes DTN.
public interface ITransactionService
{
    // Por que: Retorna todas as transações cadastradas na base.
    IEnumerable<TransactionResponse> GetAllTransactions();

    // Por que: Retorna os detalhes de uma transação pelo seu identificador primário.
    TransactionResponse GetTransactionById(long id);

    // Por que: Cria uma nova transação financeira, gerando o bundle correspondente e aplicando débitos.
    TransactionResponse CreateTransaction(TransactionRequest request);

    // Por que: Aplica o crédito em transações cujo bundle foi entregue no destino final.
    void ReconcileDeliveredTransactions();
}

// Por que: Implementação concreta das regras de liquidação síncrona e assíncrona tolerante a falhas.
public class TransactionService : ITransactionService
{
    // Por que: Contexto do banco para leitura e escrita dos dados.
    private readonly ChronosDbContext _context;

    // Por que: Construtor injetando o contexto do banco de dados.
    public TransactionService(ChronosDbContext context)
    {
        // Por que: Inicializa a propriedade de banco privada.
        _context = context;
    }

    // Por que: Retorna a lista de transações com mapeamento de relacionamento.
    public IEnumerable<TransactionResponse> GetAllTransactions()
    {
        // Por que: Busca todas as transações incluindo os nós e contas de origem/destino.
        return _context.Transactions
            .Include(t => t.SourceAccount)
            .ThenInclude(a => a!.Node)
            .Include(t => t.DestAccount)
            .Select(t => ConvertToResponse(t))
            .ToList();
    }

    // Por que: Busca uma transação por ID, lançando erro customizado se não localizada.
    public TransactionResponse GetTransactionById(long id)
    {
        // Por que: Busca a transação contendo os nós e contas associados.
        var transaction = _context.Transactions
            .Include(t => t.SourceAccount)
            .ThenInclude(a => a!.Node)
            .Include(t => t.DestAccount)
            .FirstOrDefault(t => t.Id == id);

        // Por que: Lança erro de negócio se a transação for nula.
        if (transaction == null)
        {
            // Por que: Lança ResourceNotFoundException com explicação.
            throw new ResourceNotFoundException($"Transação não localizada com ID: {id}");
        }

        // Por que: Retorna o DTO de resposta correspondente.
        return ConvertToResponse(transaction);
    }

    // Por que: Cria a transação financeira, realiza débitos, valida limites e enfileira bundles DTN se necessário.
    public TransactionResponse CreateTransaction(TransactionRequest request)
    {
        // Por que: Busca a conta bancária de origem mapeando seu nó de rede.
        var sourceAccount = _context.Accounts
            .Include(a => a.Node)
            .FirstOrDefault(a => a.Id == request.SourceAccountId)
            ?? throw new ResourceNotFoundException($"Conta de origem não cadastrada. ID: {request.SourceAccountId}");

        // Por que: Busca a conta bancária de destino mapeando seu nó correspondente.
        var destAccount = _context.Accounts
            .Include(a => a.Node)
            .FirstOrDefault(a => a.Id == request.DestAccountId)
            ?? throw new ResourceNotFoundException($"Conta de destino não cadastrada. ID: {request.DestAccountId}");

        // Por que: Define o limite negativo operacional permitido (ex: -10000 Lunar Credits).
        decimal creditLimit = -10000.00m;
        // Por que: Calcula qual seria o saldo da conta de origem pós transação.
        decimal newSourceBalance = sourceAccount.Balance - request.Amount!.Value;

        // Por que: Valida se o saldo pós débito ultrapassa o limite de crédito negativo.
        if (newSourceBalance < creditLimit)
        {
            // Por que: Lança exceção de fundos insuficientes.
            throw new InsufficientFundsException($"Saldo insuficiente na conta de origem. Saldo atual: {sourceAccount.Balance}, limite: {creditLimit}");
        }

        // Por que: Efetua o débito do saldo da conta remetente de forma síncrona imediata.
        sourceAccount.Balance = newSourceBalance;

        // Por que: Calcula os identificadores manuais para desenvolvimento (count + 1).
        long transactionId = _context.Transactions.Count() + 1;
        long bundleId = _context.Bundles.Count() + 1;

        // Por que: Verifica se as contas envolvidas pertencem ao mesmo nó físico de rádio.
        bool isSameNode = sourceAccount.NodeId == destAccount.NodeId;

        // Por que: Se pertencerem ao mesmo nó, a transferência é local e líquida imediatamente.
        if (isSameNode)
        {
            // Por que: Soma o valor correspondente no saldo da conta do destinatário.
            destAccount.Balance += request.Amount.Value;
        }

        // Por que: Serializa o payload JSON com o formato exato da API Java para compatibilidade de rede.
        string amountStr = request.Amount.Value.ToString("0.00", CultureInfo.InvariantCulture);
        // Por que: Constrói a string de dados em JSON.
        string payload = $"{{\"transactionId\":{transactionId},\"sourceAccountId\":{sourceAccount.Id},\"destAccountId\":{destAccount.Id},\"amount\":{amountStr},\"priority\":{request.Priority!.Value}}}";

        // Por que: Calcula o hash criptográfico SHA-256 para o payload.
        string payloadHash = CalculateSha256(payload);

        // Por que: Instancia o bundle espacial de transporte (Store-and-Forward).
        var bundle = new Bundle
        {
            SourceNodeId = sourceAccount.NodeId,
            SourceNode = sourceAccount.Node,
            LocalSequenceId = bundleId,
            DestNodeId = destAccount.NodeId,
            DestNode = destAccount.Node,
            Payload = payload,
            Hash = payloadHash,
            Priority = request.Priority.Value,
            // Por que: Se for local, marca como entregue. Se for remoto, marca como no buffer.
            TransmissionStatus = isSameNode ? "DELIVERED" : "BUFFERED",
            CreatedTime = DateTime.UtcNow,
            // Por que: TTL de 1 dia para tráfego local, e de 2 dias para roteamento espacial.
            ExpiryTime = DateTime.UtcNow.AddDays(isSameNode ? 1 : 2)
        };
        // Por que: Enfileira o bundle no contexto.
        _context.Bundles.Add(bundle);

        // Por que: Instancia a transação financeira para persistência local.
        var transaction = new Transaction
        {
            Id = transactionId,
            BundleId = bundleId,
            SourceAccountId = sourceAccount.Id,
            SourceAccount = sourceAccount,
            DestAccountId = destAccount.Id,
            DestAccount = destAccount,
            Amount = request.Amount.Value,
            TransactionTime = DateTime.UtcNow,
            // Por que: Transações locais nascem consolidadas, transações remotas ficam aguardando reconciliação orbital.
            SettlementStatus = isSameNode ? "SETTLED" : "PENDING"
        };
        // Por que: Adiciona a transação no contexto.
        _context.Transactions.Add(transaction);

        // Por que: Salva fisicamente todas as alterações na base relacional do gateway.
        _context.SaveChanges();

        // Por que: Converte a transação gerada no DTO de resposta final.
        return ConvertToResponse(transaction);
    }

    // Por que: Varre transações pendentes de envio remoto e atualiza saldos no destino caso os bundles tenham chegado.
    public void ReconcileDeliveredTransactions()
    {
        // Por que: Seleciona todas as transações que ainda se encontram pendentes de sincronismo espacial.
        var pendingTransactions = _context.Transactions
            .Include(t => t.SourceAccount)
            .ThenInclude(a => a!.Node)
            .Include(t => t.DestAccount)
            .Where(t => t.SettlementStatus == "PENDING")
            .ToList();

        // Por que: Itera em cada transação sob análise.
        foreach (var tx in pendingTransactions)
        {
            // Por que: Pega o ID do nó de origem da transação.
            long sourceNodeId = tx.SourceAccount!.NodeId;
            // Por que: Recupera o ID do bundle que serve de transporte.
            long bundleId = tx.BundleId;

            // Por que: Procura o bundle associado na base de dados.
            var bundle = _context.Bundles
                .FirstOrDefault(b => b.SourceNodeId == sourceNodeId && b.LocalSequenceId == bundleId);

            // Por que: Se o bundle correspondente foi localizado e seu status for entregue (DELIVERED):
            if (bundle != null && bundle.TransmissionStatus == "DELIVERED")
            {
                // Por que: Efetua o crédito do saldo da conta destinatária correspondente.
                tx.DestAccount!.Balance += tx.Amount;
                // Por que: Atualiza o status de liquidação para liquidada com sucesso.
                tx.SettlementStatus = "SETTLED";
            }
        }

        // Por que: Persiste as alterações e atualizações de saldo no banco de dados.
        _context.SaveChanges();
    }

    // Por que: Mapeia o objeto Transaction para o DTO de resposta exposto aos clientes externos.
    private static TransactionResponse ConvertToResponse(Transaction transaction)
    {
        return new TransactionResponse(
            transaction.Id,
            transaction.BundleId,
            transaction.SourceAccount!.NodeId,
            transaction.SourceAccountId,
            transaction.DestAccountId,
            transaction.Amount,
            transaction.SettlementStatus,
            transaction.TransactionTime
        );
    }

    // Por que: Calcula a assinatura SHA-256 do payload JSON, garantindo integridade lógica do pacote de rede.
    private static string CalculateSha256(string text)
    {
        // Por que: Cria o manipulador do algoritmo SHA-256.
        using var sha256 = SHA256.Create();
        // Por que: Transforma o texto do payload em array de bytes UTF-8 e calcula o hash.
        byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(text));
        // Por que: Buffer para criar a representação textual hexadecimal do hash.
        var hexString = new StringBuilder();
        // Por que: Converte cada byte para seu correspondente hexadecimal.
        foreach (byte b in hashBytes)
        {
            // Por que: Formata em hexadecimal em minúsculas (x2) e adiciona ao buffer.
            hexString.Append(b.ToString("x2"));
        }
        // Por que: Retorna a string hexadecimal completa de 64 caracteres.
        return hexString.ToString();
    }
}
