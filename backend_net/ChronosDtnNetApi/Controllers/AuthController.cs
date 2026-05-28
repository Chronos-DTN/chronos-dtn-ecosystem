// Por que: Importa os namespaces do ASP.NET Core para estruturação de controllers de API, CORS e validações.
using Microsoft.AspNetCore.Mvc;
// Por que: Importa os namespaces do .NET para tarefas assíncronas.
using System.Threading.Tasks;
// Por que: Importa o namespace das DTOs de login e resposta.
using ChronosDtnNetApi.DTOs;
// Por que: Importa a interface do serviço de autenticação.
using ChronosDtnNetApi.Services;

// Por que: Define o namespace Controllers para organizar as portas de entrada HTTP da API.
namespace ChronosDtnNetApi.Controllers;

// Por que: Sinaliza que a classe responde chamadas de API, aplicando validação automática de ModelState.
[ApiController]
// Por que: Define o padrão de rotas "/api/auth" para este controlador.
[Route("api/auth")]
public class AuthController : ControllerBase
{
    // Por que: Mantém a referência privada ao serviço de autenticação de operadores.
    private readonly IAuthService _authService;

    // Por que: Construtor injetando o serviço de autenticação.
    public AuthController(IAuthService authService)
    {
        // Por que: Inicializa o serviço privado.
        _authService = authService;
    }

    // Por que: Endpoint POST /api/auth/login que valida credenciais e emite o token JWT para o operador.
    [HttpPost("login")]
    public ActionResult<TokenResponse> Login([FromBody] LoginRequest request)
    {
        // Por que: Invoca o serviço de autenticação para validar o operador.
        var response = _authService.Authenticate(request);
        // Por que: Retorna HTTP 200 OK com o token de autorização.
        return Ok(response);
    }
}
