// Por que: Importa o namespace System.ComponentModel.DataAnnotations para permitir validações de entrada via anotações.
using System.ComponentModel.DataAnnotations;

// Por que: Define o namespace DTOs para organizar objetos de transferência de dados da API.
namespace ChronosDtnNetApi.DTOs;

// Por que: Record imutável representando a requisição de login contendo as credenciais do operador.
public record LoginRequest(
    // Por que: O nome de usuário do operador deve ser fornecido obrigatoriamente.
    [Required(ErrorMessage = "Username é obrigatório")]
    string Username,

    // Por que: A senha de segurança deve ser fornecida obrigatoriamente.
    [Required(ErrorMessage = "Senha é obrigatória")]
    string Password
);
