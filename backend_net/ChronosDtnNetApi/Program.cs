// Por que: Importa namespaces do ASP.NET Core para autenticação e persistência de dados.
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
// Por que: Importa namespaces para a documentação de API OpenAPI/Swagger.
using Microsoft.OpenApi.Models;
// Por que: Importa namespaces para validação de assinatura de token JWT.
using Microsoft.IdentityModel.Tokens;
// Por que: Importa namespaces utilitários do sistema para texto e tempo.
using System;
using System.Text;
// Por que: Importa a definição do banco de dados local.
using ChronosDtnNetApi.Data;
// Por que: Importa as classes de serviços de negócio.
using ChronosDtnNetApi.Services;
// Por que: Importa os middlewares de pipeline HTTP.
using ChronosDtnNetApi.Middlewares;
// Por que: Importa os modelos de domínio do banco.
using ChronosDtnNetApi.Models;

// Por que: Cria a instância do builder da aplicação web configurando dependências padrão do .NET.
var builder = WebApplication.CreateBuilder(args);

// Por que: Adiciona suporte a controllers de API do ASP.NET Core MVC.
builder.Services.AddControllers();

// Por que: Adiciona suporte a endpoints OpenAPI para o Swagger.
builder.Services.AddEndpointsApiExplorer();

// Por que: Configura o Swagger Gen para documentação interativa e suporte a autenticação JWT no navegador.
builder.Services.AddSwaggerGen(c =>
{
    // Por que: Define as informações básicas da API auxiliar na interface do Swagger.
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ChronosDTN Auxiliary API", Version = "v1" });

    // Por que: Define o esquema de segurança com autenticação via token Bearer no Swagger.
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autenticação baseada em JWT. Exemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Por que: Exige o uso do token JWT configurado para liberar as requisições autenticadas no Swagger.
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Por que: Adiciona e configura a persistência do Entity Framework Core em memória para simulação rápida local.
builder.Services.AddDbContext<ChronosDbContext>(options =>
    options.UseInMemoryDatabase("ChronosDtnInMemoryDb"));

// Por que: Registra as classes de serviço sob escopo (Scoped) para injeção de dependência no ciclo de requisição.
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBundleService, BundleService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

// Por que: Configura as opções do CORS para permitir chamadas do frontend mobile e de outros nós da rede espacial.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // Por que: Habilita qualquer nó de origem a se conectar ao gateway auxiliar.
        policy.AllowAnyOrigin()
              // Por que: Permite qualquer cabeçalho de cabeçalho padrão de requisição (Authorization, Content-Type).
              .AllowAnyHeader()
              // Por que: Habilita todos os verbos operacionais da API.
              .AllowAnyMethod();
    });
});

// Por que: Configura a validação do token JWT recebido no cabeçalho Authorization da requisição.
builder.Services.AddAuthentication(options =>
{
    // Por que: Define que a autenticação e validação de desafio padrão usarão o padrão JwtBearer.
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Por que: Especifica os parâmetros de validação para conferência do token digital de rádio.
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Por que: Exige que o emissor do token seja validado.
        ValidateIssuer = true,
        // Por que: Exige que o receptor final (audiência) do token seja validado.
        ValidateAudience = true,
        // Por que: Exige a validação do tempo de expiração do token (TTL).
        ValidateLifetime = true,
        // Por que: Exige que a chave secreta de assinatura digital do token seja conferida.
        ValidateIssuerSigningKey = true,
        // Por que: Define o emissor oficial cadastrado no appsettings.json.
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        // Por que: Define a audiência oficial cadastrada no appsettings.json.
        ValidAudience = builder.Configuration["Jwt:Audience"],
        // Por que: Define a chave de segurança simétrica simétrica decodificada da Base64.
        IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(builder.Configuration["Jwt:Secret"] ?? string.Empty))
    };
});

// Por que: Adiciona suporte a regras de autorização baseadas em permissões / claims do operador.
builder.Services.AddAuthorization();

// Por que: Compila o pipeline do ASP.NET Core com as configurações registradas.
var app = builder.Build();

// Por que: Ativa o Swagger UI interativo no pipeline HTTP.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    // Por que: Define o endpoint e título da página Swagger.
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ChronosDTN Auxiliary API v1");
    // Por que: Remove a barra de rota inicial abrindo o Swagger como rota raiz de dev.
    c.RoutePrefix = string.Empty;
});

// Por que: Habilita o middleware de tratamento global de erros customizados (RFC 7807).
app.UseMiddleware<ExceptionMiddleware>();

// Por que: Registra as diretivas CORS configuradas no builder.
app.UseCors("AllowAll");

// Por que: Ativa a verificação de token de autenticação JWT nas requisições.
app.UseAuthentication();

// Por que: Ativa as checagens de autorização no pipeline HTTP.
app.UseAuthorization();

// Por que: Mapeia as controllers para responderem aos endpoints HTTP.
app.MapControllers();

// Por que: Realiza a carga inicial dos dados simulados (Database Seed) ao iniciar o gateway.
using (var scope = app.Services.CreateScope())
{
    // Por que: Obtém a instância do DbContext de persistência.
    var context = scope.ServiceProvider.GetRequiredService<ChronosDbContext>();

    // Por que: Executa a carga caso a base de nós ainda esteja vazia.
    if (!context.Nodes.Any())
    {
        // Por que: Cria e insere o Nó da Terra.
        var houstonNode = new Node { Id = 1, Name = "Houston Ground Station", Location = "Terra - EUA", Status = "ACTIVE" };
        // Por que: Cria e insere o Nó da Lua.
        var artemisNode = new Node { Id = 2, Name = "Artemis Base Alpha", Location = "Lua - Polo Sul", Status = "ACTIVE" };
        context.Nodes.AddRange(houstonNode, artemisNode);

        // Por que: Salva as alterações iniciais para obter chaves estrangeiras íntegras.
        context.SaveChanges();

        // Por que: Cria a conta de fundos da estação terrena (moeda USD).
        var earthAccount = new Account { Id = 101, NodeId = 1, Holder = "Houston Ground Station Account", Balance = 500000.00m, Currency = "USD" };
        // Por que: Cria a conta da mineradora Shackleton na Lua (moeda Lunar Credits LUN).
        var moonAccount = new Account { Id = 201, NodeId = 2, Holder = "Shackleton Mining Corp Account", Balance = 150000.00m, Currency = "LUN" };
        // Por que: Cria a conta alternativa de utilidades na Lua para testes de liquidação local síncrona.
        var moonAccount2 = new Account { Id = 202, NodeId = 2, Holder = "Lunar Habitat Utilities Account", Balance = 25000.00m, Currency = "LUN" };
        context.Accounts.AddRange(earthAccount, moonAccount, moonAccount2);

        // Por que: Cria e configura uma janela de contato (link de rádio) ativo (UP) entre Terra e Lua de 12 horas.
        var activeLink = new Link
        {
            Id = 1,
            SourceNodeId = 1,
            DestNodeId = 2,
            StartTime = DateTime.UtcNow.AddHours(-1), // Por que: Janela abriu há 1 hora.
            EndTime = DateTime.UtcNow.AddHours(11),   // Por que: Janela fechará em 11 horas.
            BandwidthKbps = 1024.0,                   // Por que: Largura de banda do rádio.
            LatencySeconds = 1.280,                   // Por que: Atraso físico de velocidade da luz.
            Status = "UP"                             // Por que: Enlace funcional.
        };
        context.Links.Add(activeLink);

        // Por que: Persiste definitivamente os registros de simulação na base.
        context.SaveChanges();
    }
}

// Por que: Inicia o loop de execução do servidor HTTP do ASP.NET Core.
app.Run();
