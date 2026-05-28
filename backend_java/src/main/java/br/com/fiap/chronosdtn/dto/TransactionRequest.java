package br.com.fiap.chronosdtn.dto;

// Por que: Importa as anotações do Jakarta Validation para validação de payload no nível da Controller REST.
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

// Por que: Cria um record imutável contendo as chaves de contas e valores da operação de crédito.
public record TransactionRequest(
    // Por que: Conta de débito é obrigatória.
    @NotNull(message = "Conta de origem é obrigatória")
    Long sourceAccountId,

    // Por que: Conta de crédito é obrigatória.
    @NotNull(message = "Conta de destino é obrigatória")
    Long destAccountId,

    // Por que: O valor transferido não pode ser nulo e deve ser maior que zero.
    @NotNull(message = "Valor da transação é obrigatório")
    @Positive(message = "O valor da transação deve ser positivo")
    BigDecimal amount,

    // Por que: Prioridade do pacote DTN (0 = Baixa, 1 = Média, 2 = Alta).
    @NotNull(message = "Prioridade da transação é obrigatória")
    @Min(value = 0, message = "Prioridade mínima permitida é 0")
    @Max(value = 2, message = "Prioridade máxima permitida é 2")
    Integer priority
) {
}
