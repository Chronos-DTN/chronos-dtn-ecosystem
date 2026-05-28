// Por que: Importa o namespace base do sistema.
using System;

// Por que: Organiza as exceções no namespace adequado do projeto.
namespace ChronosDtnNetApi.Exceptions;

// Por que: Exceção de negócio disparada sempre que um recurso (nó, conta, bundle ou transação) não for localizado.
public class ResourceNotFoundException : Exception
{
    // Por que: Construtor repassando o identificador do recurso ausente para a classe base Exception.
    public ResourceNotFoundException(string message) : base(message)
    {
        // Por que: Delega a mensagem explicativa para a classe mãe.
    }
}
