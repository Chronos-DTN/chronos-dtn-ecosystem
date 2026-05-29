package br.com.fiap.chronosdtn.dto;

// Por que: Importa as anotações do Jakarta Validation para validar o corpo da requisição REST.
import jakarta.validation.constraints.*;

// Por que: Record Java para representação de dados imutáveis de solicitação de cadastro.
public record RegisterRequest(
    // Por que: Valida que o nome de usuário não seja vazio e tenha tamanho apropriado.
    @NotBlank(message = "O nome de usuário é obrigatório")
    @Size(min = 3, max = 50, message = "O nome de usuário deve conter entre 3 e 50 caracteres")
    String username,

    // Por que: Valida que a senha atenda aos requisitos mínimos de segurança.
    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, max = 100, message = "A senha deve conter pelo menos 6 caracteres")
    String password,

    // Por que: Nome completo do operador militar ou civil da estação.
    @NotBlank(message = "O nome completo é obrigatório")
    @Size(min = 3, max = 100, message = "O nome completo deve conter entre 3 e 100 caracteres")
    String fullName,

    // Por que: Identificador opcional da estação orbital onde o operador está alocado.
    @NotNull(message = "O ID do nó operacional é obrigatório")
    Long nodeId
) {}
