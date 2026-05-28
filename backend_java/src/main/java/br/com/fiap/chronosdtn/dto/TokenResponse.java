package br.com.fiap.chronosdtn.dto;

// Por que: Imutabilidade do token de retorno em chamadas de autenticação bem-sucedidas.
public record TokenResponse(
    // Por que: String contendo o token JWT criptografado gerado pela aplicação.
    String token,

    // Por que: Tipo de autenticação, fixo como Bearer (padrão RFC 6750).
    String type
) {
}
