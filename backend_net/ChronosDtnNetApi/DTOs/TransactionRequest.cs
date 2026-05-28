// Por que: Importa o namespace System.ComponentModel.DataAnnotations para validação de valores de entrada na controller.
using System.ComponentModel.DataAnnotations;

// Por que: Define o namespace DTOs para agrupar as classes de mapeamento de payloads HTTP.
namespace ChronosDtnNetApi.DTOs;

// Por que: Record imutável que representa os dados necessários para submeter uma transação financeira orbital.
public record TransactionRequest(
    // Por que: ID da conta bancária de origem que sofrerá o débito (deve ser preenchido).
    [Required(ErrorMessage = "Conta de origem é obrigatória")]
    long? SourceAccountId,

    // Por que: ID da conta bancária de destino que receberá os créditos (deve ser preenchido).
    [Required(ErrorMessage = "Conta de destino é obrigatória")]
    long? DestAccountId,

    // Por que: O valor transferido deve ser maior que zero (positivo) e é obrigatório.
    [Required(ErrorMessage = "Valor da transação é obrigatório")]
    [Range(0.01, double.MaxValue, ErrorMessage = "O valor da transação deve ser positivo")]
    decimal? Amount,

    // Por que: Nível de prioridade DTN do pacote (0 = Baixa, 1 = Média, 2 = Alta).
    [Required(ErrorMessage = "Prioridade da transação é obrigatória")]
    [Range(0, 2, ErrorMessage = "Prioridade permitida está entre 0 e 2")]
    int? Priority
);
