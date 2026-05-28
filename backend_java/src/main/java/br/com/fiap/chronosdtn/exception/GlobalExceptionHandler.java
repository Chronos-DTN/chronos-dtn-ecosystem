package br.com.fiap.chronosdtn.exception;

// Por que: Importa o objeto nativo do Spring 6/Boot 3 para suporte à RFC 7807 (Problem Details).
import org.springframework.http.ProblemDetail;
// Por que: Importa os status HTTP correspondentes.
import org.springframework.http.HttpStatus;
// Por que: Importa as anotações para capturar exceções globalmente nas controllers REST.
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
// Por que: Importa exceções padrão de falha de validação do Jakarta/Spring.
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

// Por que: Declara que esta classe interceptará exceções de todos os RestControllers da API.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Por que: Trata erros de recurso não localizado no banco de dados.
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex) {
        // Por que: Cria o ProblemDetail mapeando para HTTP 404 (Not Found).
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        // Por que: Título curto do erro.
        problemDetail.setTitle("Recurso Não Localizado");
        // Por que: Uri de referência ao tipo de erro.
        problemDetail.setType(URI.create("https://chronosdtn.fiap.com.br/errors/not-found"));
        // Por que: Adiciona metadados úteis como timestamp.
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    // Por que: Trata falhas de saldo insuficiente na liquidação bancária.
    @ExceptionHandler(InsufficientFundsException.class)
    public ProblemDetail handleInsufficientFunds(InsufficientFundsException ex) {
        // Por que: Cria o ProblemDetail mapeando para HTTP 400 (Bad Request).
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setTitle("Saldo Insuficiente");
        problemDetail.setType(URI.create("https://chronosdtn.fiap.com.br/errors/insufficient-funds"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    // Por que: Trata falhas causadas por canais rádio inativos.
    @ExceptionHandler(LinkOfflineException.class)
    public ProblemDetail handleLinkOffline(LinkOfflineException ex) {
        // Por que: Cria o ProblemDetail mapeando para HTTP 503 (Service Unavailable).
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
        problemDetail.setTitle("Link Espacial Offline");
        problemDetail.setType(URI.create("https://chronosdtn.fiap.com.br/errors/link-offline"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    // Por que: Trata erros de validação de parâmetros das chamadas REST.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationErrors(MethodArgumentNotValidException ex) {
        // Por que: Cria o ProblemDetail mapeando para HTTP 400 (Bad Request).
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Parâmetros de requisição inválidos");
        problemDetail.setTitle("Erro de Validação");
        problemDetail.setType(URI.create("https://chronosdtn.fiap.com.br/errors/validation-failed"));
        
        // Por que: Constrói uma lista contendo os campos inválidos e seus respectivos erros.
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        // Por que: Insere a lista de erros de campo como propriedade extra no JSON da RFC 7807.
        problemDetail.setProperty("errors", errors);
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    // Por que: Intercepta e mascara falhas gerais não catalogadas, evitando vazamento de stacktrace para o cliente.
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralExceptions(Exception ex) {
        // Por que: Cria o ProblemDetail mapeando para HTTP 500 (Internal Server Error).
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro interno de processamento no gateway espacial.");
        problemDetail.setTitle("Erro Interno do Servidor");
        problemDetail.setType(URI.create("https://chronosdtn.fiap.com.br/errors/internal-server-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        // Por que: Captura a causa real para auditoria de console do servidor.
        problemDetail.setProperty("debug_message", ex.getMessage());
        return problemDetail;
    }
}
