// Por que: Importa o namespace base do sistema para herdar de Exception.
using System;

// Por que: Define o namespace Exceptions para organizar as classes de erros customizados.
namespace ChronosDtnNetApi.Exceptions;

// Por que: Exceção customizada disparada quando uma conta tenta transferir créditos além do limite permitido.
public class InsufficientFundsException : Exception
{
    // Por que: Construtor que passa a mensagem de erro detalhada à classe base Exception.
    public InsufficientFundsException(string message) : base(message)
    {
        // Por que: Apenas delega a inicialização para a classe pai.
    }
}
