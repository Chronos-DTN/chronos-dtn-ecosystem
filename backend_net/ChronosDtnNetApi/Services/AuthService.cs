// Por que: Importa namespaces do sistema para criptografia, tempo e strings.
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
// Por que: Importa classes para geração de chaves simétricas e credenciais de assinatura do JWT.
using Microsoft.IdentityModel.Tokens;
// Por que: Importa as configurações do .NET para ler o appsettings.json.
using Microsoft.Extensions.Configuration;
// Por que: Importa as classes de DTO para entrada e saída.
using ChronosDtnNetApi.DTOs;

// Por que: Organiza as classes de serviço dentro de um namespace estruturado.
namespace ChronosDtnNetApi.Services;

// Por que: Interface que define o contrato do serviço de autenticação para desacoplamento e testes.
public interface IAuthService
{
    // Por que: Método assíncrono para autenticar o operador e retornar o token assinado.
    TokenResponse Authenticate(LoginRequest request);
}

// Por que: Implementação concreta do serviço de autenticação baseada nas políticas de controle de missão.
public class AuthService : IAuthService
{
    // Por que: Armazena o acesso às configurações do appsettings.json.
    private readonly IConfiguration _configuration;

    // Por que: Construtor injetando as configurações do framework.
    public AuthService(IConfiguration configuration)
    {
        // Por que: Inicializa a propriedade privada com a instância injetada.
        _configuration = configuration;
    }

    // Por que: Executa a validação de credenciais do operador e gera o JWT correspondente.
    public TokenResponse Authenticate(LoginRequest request)
    {
        // Por que: Verifica se as credenciais coincidem com o operador padrão da FIAP Global Solution.
        if (request.Username == "operator" && request.Password == "space_dtn_2026")
        {
            // Por que: Lê a chave secreta codificada em Base64 configurada nas propriedades.
            string secretKeyBase64 = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Chave secreta JWT não configurada.");

            // Por que: Decodifica a chave secreta base64 para obter os bytes brutos da assinatura HMAC.
            byte[] keyBytes = Convert.FromBase64String(secretKeyBase64);

            // Por que: Cria uma chave simétrica de criptografia com base nos bytes obtidos.
            var symmetricKey = new SymmetricSecurityKey(keyBytes);

            // Por que: Configura as credenciais de assinatura usando o algoritmo HMAC SHA256.
            var signingCredentials = new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256Signature);

            // Por que: Define a lista de claims (declarações) do operador autenticado no token.
            var claims = new List<Claim>
            {
                // Por que: Subject do token contendo o username do operador.
                new Claim(JwtRegisteredClaimNames.Sub, request.Username),
                // Por que: Identificador único do token.
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                // Por que: Claim customizada indicando o ID do nó de rede padrão (ex: 1 para Houston).
                new Claim("node_id", "1"),
                // Por que: Nome da estação terrena associada.
                new Claim("node_name", "Houston Deep Space Station"),
                // Por que: Claim de autorização contendo a Role de operador.
                new Claim(ClaimTypes.Role, "ROLE_OPERATOR")
            };

            // Por que: Lê o tempo de expiração do token em horas.
            double expirationHours = double.Parse(_configuration["Jwt:ExpirationHours"] ?? "8");

            // Por que: Define o cabeçalho e payload do token JWT.
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                // Por que: Define as claims definidas no bloco anterior.
                Subject = new ClaimsIdentity(claims),
                // Por que: Define a expiração do token baseado na hora UTC atual adicionado das horas limite.
                Expires = DateTime.UtcNow.AddHours(expirationHours),
                // Por que: Define as credenciais de assinatura criptográfica.
                SigningCredentials = signingCredentials,
                // Por que: Define o emissor (Issuer) do token configurado.
                Issuer = _configuration["Jwt:Issuer"],
                // Por que: Define a audiência (Audience) autorizada do token.
                Audience = _configuration["Jwt:Audience"]
            };

            // Por que: Inicializa o manipulador responsável por serializar o token.
            var tokenHandler = new JwtSecurityTokenHandler();

            // Por que: Cria o token com base no descritor de segurança fornecido.
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);

            // Por que: Serializa o token de segurança para seu formato final em string compacta.
            string tokenString = tokenHandler.WriteToken(securityToken);

            // Por que: Retorna o token envelopado no DTO de resposta padrão.
            return new TokenResponse(tokenString, "Bearer");
        }
        else
        {
            // Por que: Caso as credenciais não batam, lança exceção de acesso inválido.
            throw new UnauthorizedAccessException("Usuário ou senha inválidos para o painel operacional.");
        }
    }
}
