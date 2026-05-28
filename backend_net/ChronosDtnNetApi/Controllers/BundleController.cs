// Por que: Importa os namespaces do ASP.NET Core para APIs, verbos HTTP, mapeamento e retornos.
using Microsoft.AspNetCore.Mvc;
// Por que: Importa namespace do ASP.NET Core para autenticação e controle de acesso com [Authorize].
using Microsoft.AspNetCore.Authorization;
// Por que: Importa namespaces do sistema para data/hora, dicionários e LINQ.
using System;
using System.Collections.Generic;
using System.Linq;
// Por que: Importa as interfaces dos serviços de bundles e de transações.
using ChronosDtnNetApi.Services;

// Por que: Organiza as classes controladoras sob o namespace Controllers.
namespace ChronosDtnNetApi.Controllers;

// Por que: Restringe acesso a esta controller apenas para operadores autenticados via JWT.
[Authorize]
// Por que: Habilita validações estruturais e formatação automatizada do ASP.NET Core.
[ApiController]
// Por que: Define a rota raiz do controlador como "/api/bundles".
[Route("api/bundles")]
public class BundleController : ControllerBase
{
    // Por que: Referência privada ao serviço de gerenciamento da fila de bundles.
    private readonly IBundleService _bundleService;
    // Por que: Referência privada ao serviço de reconciliação de transações.
    private readonly ITransactionService _transactionService;

    // Por que: Construtor injetando os serviços correspondentes.
    public BundleController(IBundleService bundleService, ITransactionService transactionService)
    {
        // Por que: Inicializa os serviços locais.
        _bundleService = bundleService;
        _transactionService = transactionService;
    }

    // Por que: Endpoint GET /api/bundles que lista a fila Store-and-Forward de pacotes espaciais com links HATEOAS.
    [HttpGet(Name = "GetAllBundles")]
    public ActionResult GetAllBundles()
    {
        // Por que: Recupera todos os bundles da fila por meio do serviço.
        var bundles = _bundleService.GetAllBundles();

        // Por que: Mapeia cada bundle no padrão HAL JSON contendo as chaves compostas e links self.
        var hateoasBundles = bundles.Select(b => new
        {
            SourceNodeId = b.SourceNodeId,
            LocalSequenceId = b.LocalSequenceId,
            DestNodeId = b.DestNodeId,
            Payload = b.Payload,
            Hash = b.Hash,
            Priority = b.Priority,
            TransmissionStatus = b.TransmissionStatus,
            CreatedTime = b.CreatedTime,
            ExpiryTime = b.ExpiryTime,
            // Por que: Anexa o metadado do link para recuperar o bundle individualmente.
            _links = new
            {
                self = new { href = Url.Link("GetBundleById", new { sourceNodeId = b.SourceNodeId, localSequenceId = b.LocalSequenceId }) }
            }
        }).ToList();

        // Por que: Cria o envelope contendo a lista e o link da rota atual.
        var response = new
        {
            _embedded = new
            {
                bundles = hateoasBundles
            },
            _links = new
            {
                self = new { href = Url.Link("GetAllBundles", null) }
            }
        };

        // Por que: Retorna HTTP 200 OK com a coleção e seus hiperlinks.
        return Ok(response);
    }

    // Por que: Endpoint GET /api/bundles/{sourceNodeId}/{localSequenceId} que busca um bundle específico por chave composta.
    [HttpGet("{sourceNodeId}/{localSequenceId}", Name = "GetBundleById")]
    public ActionResult GetBundleById(long sourceNodeId, long localSequenceId)
    {
        // Por que: Busca o bundle específico pelo serviço.
        var b = _bundleService.GetBundleById(sourceNodeId, localSequenceId);

        // Por que: Cria o retorno individual estruturado com links self e coleção.
        var response = new
        {
            SourceNodeId = b.SourceNodeId,
            LocalSequenceId = b.LocalSequenceId,
            DestNodeId = b.DestNodeId,
            Payload = b.Payload,
            Hash = b.Hash,
            Priority = b.Priority,
            TransmissionStatus = b.TransmissionStatus,
            CreatedTime = b.CreatedTime,
            ExpiryTime = b.ExpiryTime,
            _links = new
            {
                self = new { href = Url.Link("GetBundleById", new { sourceNodeId = b.SourceNodeId, localSequenceId = b.LocalSequenceId }) },
                allBundles = new { href = Url.Link("GetAllBundles", null) }
            }
        };

        // Por que: Retorna HTTP 200 OK com o objeto formatado.
        return Ok(response);
    }

    // Por que: Endpoint POST /api/bundles/transmit que simula contatos de rádio e liquida transações pós-janela.
    [HttpPost("transmit")]
    public ActionResult TransmitBundles()
    {
        // Por que: Invoca a rotina de transmissão física de pacotes no rádio.
        int bundlesTransmitted = _bundleService.TransmitPendingBundles();

        // Por que: Dispara a reconciliação bancária de transações remotas cujos bundles foram entregues.
        _transactionService.ReconcileDeliveredTransactions();

        // Por que: Constrói a resposta informativa de auditoria operacional.
        var response = new Dictionary<string, object>
        {
            { "message", "Simulação de transmissão orbital e reconciliação financeira disparada com sucesso." },
            { "bundlesTransmitted", bundlesTransmitted },
            { "timestamp", DateTime.UtcNow }
        };

        // Por que: Retorna HTTP 200 OK informando o status da operação espacial.
        return Ok(response);
    }
}
