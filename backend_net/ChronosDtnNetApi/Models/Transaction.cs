using System;

namespace ChronosDtnNetApi.Models;

// Por que: Representa a transação financeira real que é envelopada e transmitida pela rede espacial.
public class Transaction
{
    // Por que: Identificador único da transação financeira gerado pelo banco.
    public long Id { get; set; }

    // Por que: Referência ao ID sequencial local do bundle de rede associado. Mantido numérico para desacoplamento.
    public long BundleId { get; set; }

    // Por que: Referência estrangeira da conta financeira debitada (origem).
    public long SourceAccountId { get; set; }

    // Por que: Instância da conta financeira debitada.
    public Account? SourceAccount { get; set; }

    // Por que: Referência estrangeira da conta financeira creditada (destino).
    public long DestAccountId { get; set; }

    // Por que: Instância da conta financeira creditada.
    public Account? DestAccount { get; set; }

    // Por que: Valor monetário da operação financeira.
    public decimal Amount { get; set; }

    // Por que: Carimbo de data/hora de registro local da operação.
    public DateTime TransactionTime { get; set; }

    // Por que: Status de liquidação no gateway (PENDING, SETTLED, REJECTED).
    public string SettlementStatus { get; set; } = string.Empty;
}
