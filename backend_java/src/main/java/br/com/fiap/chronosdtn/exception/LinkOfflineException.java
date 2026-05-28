package br.com.fiap.chronosdtn.exception;

// Por que: Permite reportar falhas físicas de rádio quando a transação crítica exige sincronização em tempo real.
public class LinkOfflineException extends RuntimeException {

    // Por que: Construtor contendo os detalhes do link offline.
    public LinkOfflineException(String message) {
        super(message);
    }
}
