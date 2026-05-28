package br.com.fiap.chronosdtn.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Por que: Record imutável contendo as informações geradas pós processamento de banco de dados.
public record TransactionResponse(
    // Por que: ID único da transação financeira gerado pelo banco.
    Long transactionId,

    // Por que: ID do bundle DTN associado (essencial para HATEOAS e auditoria de roteador).
    Long bundleId,

    // Por que: ID do nó de origem da transação (necessário para reconstrução da chave composta do bundle).
    Long sourceNodeId,

    // Por que: ID da conta que sofreu o débito.
    Long sourceAccountId,

    // Por que: ID da conta que sofreu o crédito.
    Long destAccountId,

    // Por que: Valor transferido.
    BigDecimal amount,

    // Por que: Status consolidado da operação (PENDING, SETTLED, REJECTED).
    String settlementStatus,

    // Por que: Carimbo de data/hora do registro de liquidação.
    LocalDateTime transactionTime
) {
}
