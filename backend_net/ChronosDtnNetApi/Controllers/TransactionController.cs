// Por que: Importa namespaces do ASP.NET Core para endpoints de API, rotas, verbos HTTP e CORS.
using Microsoft.AspNetCore.Mvc;
// Por que: Importa namespace do ASP.NET Core para autenticação e controle de acesso com [Authorize].
using Microsoft.AspNetCore.Authorization;
// Por que: Importa namespaces do .NET para manipulação de listas e projeções com LINQ.
using System.Linq;
// Por que: Importa os DTOs de requisição e resposta da API.
using ChronosDtnNetApi.DTOs;
// Por que: Importa as interfaces de serviço de transações e bundles.
using ChronosDtnNetApi.Services;

// Por que: Organiza as controllers sob o namespace Controllers.
namespace ChronosDtnNetApi.Controllers;

// Por que: Restringe acesso a esta controller apenas para operadores autenticados via JWT.
[Authorize]
// Por que: Define a classe como ApiController de ASP.NET Core Web API.
[ApiController]
// Por que: Mapeia a rota padrão para "/api/transactions".
[Route("api/transactions")]
public class TransactionController : ControllerBase
{
    // Por que: Mantém a referência privada ao serviço de transações.
    private readonly ITransactionService _transactionService;

    // Por que: Construtor injetando o serviço correspondente.
    public TransactionController(ITransactionService transactionService)
    {
        // Por que: Inicializa a propriedade de serviço privada.
        _transactionService = transactionService;
    }

    // Por que: Endpoint GET /api/transactions que lista todas as transações com links HATEOAS.
    [HttpGet(Name = "GetAllTransactions")]
    public ActionResult GetAllTransactions()
    {
        // Por que: Recupera as transações do banco através do serviço.
        var transactions = _transactionService.GetAllTransactions();

        // Por que: Projeta cada transação no formato HAL JSON com links auto-descritivos.
        var hateoasTransactions = transactions.Select(t => new
        {
            // Por que: Copia as propriedades de dados da transação.
            t.TransactionId,
            t.BundleId,
            t.SourceNodeId,
            t.SourceAccountId,
            t.DestAccountId,
            t.Amount,
            t.SettlementStatus,
            t.TransactionTime,
            // Por que: Adiciona o nó de metadados de links da RFC de Hypermedia (HATEOAS).
            _links = new
            {
                // Por que: Link direto (self) para obter esta transação específica.
                self = new { href = Url.Link("GetTransactionById", new { id = t.TransactionId }) },
                // Por que: Link para o bundle físico associado que transporta a transação.
                transportBundle = new { href = Url.Link("GetBundleById", new { sourceNodeId = t.SourceNodeId, localSequenceId = t.BundleId }) }
            }
        }).ToList();

        // Por que: Cria o envelope de retorno com os links do recurso coleção.
        var response = new
        {
            _embedded = new
            {
                transactions = hateoasTransactions
            },
            _links = new
            {
                self = new { href = Url.Link("GetAllTransactions", null) }
            }
        };

        // Por que: Retorna HTTP 200 OK com o JSON contendo os dados e os links HATEOAS.
        return Ok(response);
    }

    // Por que: Endpoint GET /api/transactions/{id} que obtém detalhes de uma transação específica por ID com links HATEOAS.
    [HttpGet("{id}", Name = "GetTransactionById")]
    public ActionResult GetTransactionById(long id)
    {
        // Por que: Busca a transação no serviço.
        var t = _transactionService.GetTransactionById(id);

        // Por que: Constrói a resposta enriquecida com os links daquela transação individual.
        var response = new
        {
            t.TransactionId,
            t.BundleId,
            t.SourceNodeId,
            t.SourceAccountId,
            t.DestAccountId,
            t.Amount,
            t.SettlementStatus,
            t.TransactionTime,
            _links = new
            {
                self = new { href = Url.Link("GetTransactionById", new { id = t.TransactionId }) },
                transportBundle = new { href = Url.Link("GetBundleById", new { sourceNodeId = t.SourceNodeId, localSequenceId = t.BundleId }) },
                allTransactions = new { href = Url.Link("GetAllTransactions", null) }
            }
        };

        // Por que: Retorna HTTP 200 OK com a transação e seus hiperlinks.
        return Ok(response);
    }

    // Por que: Endpoint POST /api/transactions que recebe dados de transferência, debita saldo e enfileira pacotes.
    [HttpPost]
    public ActionResult CreateTransaction([FromBody] TransactionRequest request)
    {
        // Por que: Invoca o serviço para criar a transação.
        var t = _transactionService.CreateTransaction(request);

        // Por que: Constrói a resposta HAL correspondente para a nova transação criada.
        var response = new
        {
            t.TransactionId,
            t.BundleId,
            t.SourceNodeId,
            t.SourceAccountId,
            t.DestAccountId,
            t.Amount,
            t.SettlementStatus,
            t.TransactionTime,
            _links = new
            {
                self = new { href = Url.Link("GetTransactionById", new { id = t.TransactionId }) },
                transportBundle = new { href = Url.Link("GetBundleById", new { sourceNodeId = t.SourceNodeId, localSequenceId = t.BundleId }) }
            }
        };

        // Por que: Retorna HTTP 201 Created com a transação criada e a URL de acesso no cabeçalho Location.
        return CreatedAtRoute("GetTransactionById", new { id = t.TransactionId }, response);
    }
}
