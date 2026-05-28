// Por que: Importa o namespace base do .NET para herdar a classe Exception.
using System;

// Por que: Organiza as exceções dentro de um namespace estruturado.
namespace ChronosDtnNetApi.Exceptions;

// Por que: Exceção disparada caso uma operação síncrona dependa de um link que esteja temporariamente indisponível.
public class LinkOfflineException : Exception
{
    // Por que: Construtor repassando a mensagem de erro explicativa do rádio off-line para a classe pai.
    public LinkOfflineException(string message) : base(message)
    {
        // Por que: Delega a mensagem para a inicialização da classe base.
    }
}
