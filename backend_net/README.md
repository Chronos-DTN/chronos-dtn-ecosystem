# ChronosDTN Auxiliary API (.NET 10)

Ecosistema de gateway financeiro tolerante a falhas (DTN - Delay-Tolerant Networking) ligando a Terra à Lua. Esta é a API auxiliar desenvolvida em .NET 10 para o projeto acadêmico **FIAP Global Solution** (Economia Espacial).

---

## 🚀 Arquitetura e Visão Geral

A API auxiliar do **ChronosDTN** atua como o nó secundário/terreno do gateway. Suas principais atribuições são:
1. **Autenticação de Operadores**: Emissão de tokens JWT criptografados para garantir que apenas comandos assinados controlem os enlaces de rádio e as transações espaciais.
2. **Buffer Store-and-Forward**: Fila local estruturada de pacotes (Bundles) para lidar com a latência de rádio (1.28 segundos de atraso da luz entre Terra e Lua) e janelas de contato intermitentes.
3. **Liquidação Financeira e Reconciliação**: Controle transacional de saldos, permitindo débitos síncronos na conta do remetente e créditos assíncronos no destino assim que o pacote DTN é recebido e validado (integridade por hash SHA-256).

---

## 🛠️ Stack Tecnológica

* **Runtime**: .NET 10.0 SDK
* **Persistência**: Entity Framework Core InMemory (simulação rápida em memória sem necessidade de bancos relacionais locais pesados)
* **Segurança**: Microsoft.AspNetCore.Authentication.JwtBearer (Assinatura simétrica com algoritmo HMAC SHA-256)
* **Documentação**: Swashbuckle.AspNetCore (Swagger/OpenAPI v1 com suporte a injeção do cabeçalho de Authorization Bearer)

---

## 🔐 Segurança e Autenticação

Todas as rotas sob `/api/transactions` e `/api/bundles` exigem autenticação do operador espacial.

* **Endpoint de Login**: `POST /api/auth/login`
* **Credenciais Padrão**:
  * **Usuário**: `operator`
  * **Senha**: `space_dtn_2026`
* **Formato do Token**: JWT Bearer anexado ao cabeçalho:
  `Authorization: Bearer <seu_token_jwt>`

---

## 🔗 Endpoints e HATEOAS (HAL JSON)

Esta API implementa o nível 3 do modelo de maturidade de Richardson (HATEOAS) utilizando o formato HAL JSON (`_links` e `_embedded`).

### 1. Autenticação
* **POST `/api/auth/login`**
  * **Request**:
    ```json
    {
      "username": "operator",
      "password": "space_dtn_2026"
    }
    ```
  * **Response**:
    ```json
    {
      "token": "eyJhbGciOi...",
      "tokenType": "Bearer"
    }
    ```

### 2. Transações
* **GET `/api/transactions`** (Lista todas as transações com hiperlinks `self` e `transportBundle`)
* **GET `/api/transactions/{id}`** (Obtém uma transação individual)
* **POST `/api/transactions`** (Cria uma nova transação financeira)
  * **Request**:
    ```json
    {
      "sourceAccountId": 101,
      "destAccountId": 201,
      "amount": 5000.00,
      "priority": 2
    }
    ```
  * **Response (HATEOAS)**:
    ```json
    {
      "transactionId": 1,
      "bundleId": 1,
      "sourceNodeId": 1,
      "sourceAccountId": 101,
      "destAccountId": 201,
      "amount": 5000.0,
      "settlementStatus": "PENDING",
      "transactionTime": "2026-05-28T20:21:01.2713864Z",
      "_links": {
        "self": {
          "href": "http://localhost:5056/api/transactions/1"
        },
        "transportBundle": {
          "href": "http://localhost:5056/api/bundles/1/1"
        }
      }
    }
    ```

### 3. Bundles (Pacotes DTN Store-and-Forward)
* **GET `/api/bundles`** (Lista todos os bundles na fila local)
* **GET `/api/bundles/{sourceNodeId}/{localSequenceId}`** (Busca um bundle individual usando a chave primária composta)
* **POST `/api/bundles/transmit`** (Simula a abertura de janela de contato de rádio. Varre bundles em status `BUFFERED`, atualiza para `DELIVERED` e reconcilia as transações associadas para `SETTLED`).

---

## 🏃 Como Executar e Validar Localmente

### Pré-requisitos
* **.NET 10.0 SDK** instalado na máquina.

### Execução da API
No terminal do Windows, acesse a pasta raiz da API e execute:
```bash
cd backend_net/ChronosDtnNetApi
dotnet build
dotnet run
```
A API será iniciada por padrão na porta `http://localhost:5056`. O Swagger UI estará disponível em:
👉 [http://localhost:5056](http://localhost:5056)

### Validação via Script Automatizado
Disponibilizamos um script em PowerShell que faz todas as requisições, simulando o comportamento de ponta a ponta. 

Na pasta `backend_net`, abra o terminal e execute:
```powershell
powershell -ExecutionPolicy Bypass -File verify_api.ps1
```

O script fará o login, registrará a transação cross-node (Terra para a Lua), listará a fila de bundles, disparará a transmissão de rádio-link e exibirá os dados finais de liquidação/entrega em formato JSON formatado.

---

## 📂 Estrutura do Projeto

* `Program.cs`: Inicialização e pipeline HTTP do ASP.NET Core (com Database Seed de nós, contas e links de rádio ativos).
* `Data/`: `ChronosDbContext.cs` mapeando o banco em memória e as relações de chave composta.
* `Models/`: Modelos com comentários didáticos em cada linha explicando o objetivo de cada propriedade.
* `Services/`:
  * `AuthService.cs`: Lógica de autenticação e validação do token JWT.
  * `BundleService.cs`: Mecanismo de store-and-forward e transmissão por link físico.
  * `TransactionService.cs`: Débitos em conta, serialização JSON e hashes de segurança.
* `Middlewares/`: `ExceptionMiddleware.cs` transformando exceções não tratadas em objetos padronizados RFC 7807 (ProblemDetails).
* `Controllers/`: Endpoints de API.
