package br.com.fiap.chronosdtn.exception;

// Por que: Permite lançar erros específicos quando recursos do gateway não são encontrados.
public class ResourceNotFoundException extends RuntimeException {
    
    // Por que: Construtor que recebe a mensagem descritiva do recurso ausente.
    public ResourceNotFoundException(String message) {
        // Por que: Passa a mensagem de erro para a classe base RuntimeException.
        super(message);
    }
}
