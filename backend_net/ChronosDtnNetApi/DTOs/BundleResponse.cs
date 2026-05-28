// Por que: Importa o namespace System para manipulação de DateTime.
using System;

// Por que: Organiza as classes no namespace de DTOs.
namespace ChronosDtnNetApi.DTOs;

// Por que: Record imutável que representa as informações de metadados de rede de um Bundle espacial na fila.
public record BundleResponse(
    // Por que: ID do nó transmissor.
    long SourceNodeId,

    // Por que: Sequencial incremental local do bundle no nó transmissor.
    long LocalSequenceId,

    // Por que: ID do nó receptor final.
    long DestNodeId,

    // Por que: Carga útil de dados (payload JSON serializado).
    string Payload,

    // Por que: Hash SHA-256 para integridade dos dados transmitidos.
    string Hash,

    // Por que: Prioridade do pacote (0 = Baixa, 1 = Média, 2 = Alta).
    int Priority,

    // Por que: Status de trânsito atual (BUFFERED, IN_TRANSIT, DELIVERED, EXPIRED).
    string TransmissionStatus,

    // Por que: Instante de criação no nó de origem.
    DateTime CreatedTime,

    // Por que: Instante limite de expiração do TTL espacial.
    DateTime ExpiryTime
);
