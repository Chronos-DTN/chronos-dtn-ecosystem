package br.com.fiap.chronosdtn.exception;

// Por que: Permite lançar exceção específica em regras de liquidação financeira.
public class InsufficientFundsException extends RuntimeException {
    
    // Por que: Construtor contendo a explicação da insuficiência de crédito.
    public InsufficientFundsException(String message) {
        super(message);
    }
}
