package br.com.fiap.chronosdtn.dto;

// Por que: Importa anotações de validação para impedir entradas vazias ou nulas no endpoint de autenticação.
import jakarta.validation.constraints.NotBlank;

// Por que: Usamos Record para garantir imutabilidade e thread-safety automática nos dados trafegados.
public record LoginRequest(
    // Por que: O nome de usuário do operador deve ser preenchido obrigatoriamente.
    @NotBlank(message = "Username é obrigatório")
    String username,

    // Por que: A senha do operador deve ser preenchida obrigatoriamente.
    @NotBlank(message = "Senha é obrigatória")
    String password
) {
}
