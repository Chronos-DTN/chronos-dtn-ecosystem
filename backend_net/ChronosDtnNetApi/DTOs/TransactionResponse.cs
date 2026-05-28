// Por que: Importa o namespace System para manipulação do tipo DateTime.
using System;

// Por que: Define o namespace DTOs para organizar as classes de mapeamento de payloads de saída.
namespace ChronosDtnNetApi.DTOs;

// Por que: Record imutável contendo as informações da transação financeira persistida.
public record TransactionResponse(
    // Por que: ID único da transação financeira gerado pelo banco.
    long TransactionId,

    // Por que: ID do bundle DTN de rede que foi associado para carregar a transação.
    long BundleId,

    // Por que: ID do nó de origem da transação (necessário para HATEOAS do bundle).
    long SourceNodeId,

    // Por que: Conta financeira que sofreu o débito.
    long SourceAccountId,

    // Por que: Conta financeira que recebeu o crédito.
    long DestAccountId,

    // Por que: Valor monetário total transferido.
    decimal Amount,

    // Por que: Status de liquidação (PENDING, SETTLED, REJECTED).
    string SettlementStatus,

    // Por que: Carimbo de data/hora no qual a transação foi processada.
    DateTime TransactionTime
);
