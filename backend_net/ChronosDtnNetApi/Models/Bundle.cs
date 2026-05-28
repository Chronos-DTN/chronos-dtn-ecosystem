using System;

namespace ChronosDtnNetApi.Models;

// Por que: Representa o pacote básico (Bundle) do protocolo DTN, contendo dados financeiros serializados e prioridade.
public class Bundle
{
    // Por que: Parte 1 da chave composta. Identificador do nó que gerou o pacote.
    public long SourceNodeId { get; set; }

    // Por que: Instância do nó remetente que realizou o empacotamento original.
    public Node? SourceNode { get; set; }

    // Por que: Parte 2 da chave composta. Sequencial numérico incremental local daquele nó específico.
    public long LocalSequenceId { get; set; }

    // Por que: Identificador estrangeiro do nó destinatário final do pacote espacial.
    public long DestNodeId { get; set; }

    // Por que: Instância do nó destinatário de destino final.
    public Node? DestNode { get; set; }

    // Por que: Dados serializados da transação financeira em formato JSON.
    public string Payload { get; set; } = string.Empty;

    // Por que: Assinatura criptográfica hash SHA-256 para auditoria de integridade física.
    public string Hash { get; set; } = string.Empty;

    // Por que: Prioridade do pacote (0 = Baixa/Telemetria, 1 = Média/Operacional, 2 = Alta/Financeira).
    public int Priority { get; set; }

    // Por que: Estado de trânsito físico do pacote (BUFFERED, IN_TRANSIT, DELIVERED, EXPIRED).
    public string TransmissionStatus { get; set; } = string.Empty;

    // Por que: Data/Hora de criação do pacote no nó de origem.
    public DateTime CreatedTime { get; set; }

    // Por que: Data/Hora de expiração final (TTL) do pacote orbital.
    public DateTime ExpiryTime { get; set; }
}
