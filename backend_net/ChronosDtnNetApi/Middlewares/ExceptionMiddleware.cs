// Por que: Importa namespaces do ASP.NET Core para requisições HTTP e tratamento de ProblemDetails da RFC 7807.
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
// Por que: Importa namespaces do sistema para manipulação de tarefas, serialização e exceções.
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
// Por que: Importa os erros de negócio customizados.
using ChronosDtnNetApi.Exceptions;

// Por que: Define o namespace Middlewares para organizar os filtros e interceptadores HTTP da aplicação.
namespace ChronosDtnNetApi.Middlewares;

// Por que: Middleware que intercepta exceções ocorridas no pipeline HTTP e retorna uma resposta padronizada RFC 7807.
public class ExceptionMiddleware
{
    // Por que: Armazena a referência para o próximo delegate no pipeline de processamento HTTP.
    private readonly RequestDelegate _next;

    // Por que: Construtor injetando o delegate de requisição.
    public ExceptionMiddleware(RequestDelegate next)
    {
        // Por que: Atribui a referência ao campo privado do middleware.
        _next = next;
    }

    // Por que: Método obrigatório do middleware que processa a requisição e captura eventuais exceções.
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            // Por que: Continua a execução do pipeline de requisições HTTP.
            await _next(httpContext);
        }
        catch (Exception ex)
        {
            // Por que: Intercepta qualquer exceção lançada pelas controllers ou serviços e processa o retorno.
            await HandleExceptionAsync(httpContext, ex);
        }
    }

    // Por que: Constrói a estrutura do ProblemDetails correspondente e serializa a resposta em JSON.
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Por que: Define o tipo de conteúdo do cabeçalho da resposta HTTP como application/problem+json (exigido pela RFC 7807).
        context.Response.ContentType = "application/problem+json";

        // Por que: Inicializa o objeto de detalhes do problema.
        var problemDetails = new ProblemDetails();

        // Por que: Avalia o tipo da exceção lançada para definir o código de status HTTP apropriado.
        switch (exception)
        {
            // Por que: Trata falhas de recurso ausente mapeando para HTTP 404 (Not Found).
            case ResourceNotFoundException:
            case KeyNotFoundException:
                // Por que: Configura o código HTTP 404 no cabeçalho.
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                // Por que: Define o título representativo amigável do erro.
                problemDetails.Title = "Recurso Não Localizado";
                // Por que: Define a URI do tipo do problema.
                problemDetails.Type = "https://chronosdtn.fiap.com.br/errors/not-found";
                // Por que: Define o status numérico.
                problemDetails.Status = (int)HttpStatusCode.NotFound;
                // Por que: Repassa a mensagem detalhada da exceção.
                problemDetails.Detail = exception.Message;
                break;

            // Por que: Trata falhas de saldo insuficiente na liquidação bancária mapeando para HTTP 400 (Bad Request).
            case InsufficientFundsException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                problemDetails.Title = "Saldo Insuficiente";
                problemDetails.Type = "https://chronosdtn.fiap.com.br/errors/insufficient-funds";
                problemDetails.Status = (int)HttpStatusCode.BadRequest;
                problemDetails.Detail = exception.Message;
                break;

            // Por que: Trata falhas de link de rádio indisponível mapeando para HTTP 503 (Service Unavailable).
            case LinkOfflineException:
                context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                problemDetails.Title = "Link Espacial Offline";
                problemDetails.Type = "https://chronosdtn.fiap.com.br/errors/link-offline";
                problemDetails.Status = (int)HttpStatusCode.ServiceUnavailable;
                problemDetails.Detail = exception.Message;
                break;

            // Por que: Trata erros de login inválido mapeando para HTTP 401 (Unauthorized).
            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                problemDetails.Title = "Operador Não Autorizado";
                problemDetails.Type = "https://chronosdtn.fiap.com.br/errors/unauthorized";
                problemDetails.Status = (int)HttpStatusCode.Unauthorized;
                problemDetails.Detail = exception.Message;
                break;

            // Por que: Tratador genérico para qualquer outra exceção interna não catalogada mapeando para HTTP 500.
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                problemDetails.Title = "Erro Interno do Servidor";
                problemDetails.Type = "https://chronosdtn.fiap.com.br/errors/internal-server-error";
                problemDetails.Status = (int)HttpStatusCode.InternalServerError;
                problemDetails.Detail = "Ocorreu um erro interno de processamento no gateway espacial auxiliar.";
                // Por que: Adiciona informação técnica de debug no corpo JSON (apenas para ambiente de desenvolvimento acadêmico).
                problemDetails.Extensions.Add("debug_message", exception.Message);
                break;
        }

        // Por que: Adiciona a propriedade de carimbo de data/hora no ProblemDetails.
        problemDetails.Extensions.Add("timestamp", DateTime.UtcNow);

        // Por que: Configura opções de serialização do JSON para manter o padrão camelCase das propriedades.
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        // Por que: Serializa o objeto ProblemDetails em string JSON com base nas opções configuradas.
        string result = JsonSerializer.Serialize(problemDetails, jsonOptions);

        // Por que: Escreve a string JSON serializada diretamente no corpo da resposta HTTP.
        return context.Response.WriteAsync(result);
    }
}
