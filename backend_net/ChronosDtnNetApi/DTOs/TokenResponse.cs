// Por que: Define o namespace DTOs para organizar a estrutura do JSON de retorno das chamadas de API.
namespace ChronosDtnNetApi.DTOs;

// Por que: Record imutável que carrega as credenciais em formato JWT para o cliente autenticado.
public record TokenResponse(
    // Por que: String contendo o token assinado gerado pelo AuthService.
    string Token,

    // Por que: Define o tipo do token, padrão da indústria "Bearer".
    string Type
);
