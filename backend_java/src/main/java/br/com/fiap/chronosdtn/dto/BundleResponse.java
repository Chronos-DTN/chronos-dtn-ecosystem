package br.com.fiap.chronosdtn.dto;

import java.time.LocalDateTime;

// Por que: Record imutável contendo os dados da fila física de pacotes orbitais.
public record BundleResponse(
    // Por que: ID do nó transmissor.
    Long sourceNodeId,

    // Por que: Sequencial incremental local do bundle no nó.
    Long localSequenceId,

    // Por que: ID do nó receptor final.
    Long destNodeId,

    // Por que: Carga útil (payload) imutável em formato string (JSON serializado).
    String payload,

    // Por que: Hash criptográfico SHA-256 para integridade física.
    String hash,

    // Por que: Prioridade do pacote (0 = Baixa, 1 = Média, 2 = Alta).
    Integer priority,

    // Por que: Status de trânsito atual (BUFFERED, IN_TRANSIT, DELIVERED, EXPIRED).
    String transmissionStatus,

    // Por que: Instante de criação no nó de origem.
    LocalDateTime createdTime,

    // Por que: Instante limite de expiração (TTL).
    LocalDateTime expiryTime
) {
}
