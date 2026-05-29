# ⚡ ChronosDTN Auxiliary API (.NET 10)

[![.NET 10](https://img.shields.io/badge/.NET-10.0-blue?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com)
[![EF Core](https://img.shields.io/badge/EF_Core-InMemory-purple?style=for-the-badge)](https://learn.microsoft.com/ef/core/)
[![HAL JSON](https://img.shields.io/badge/Format-HAL_JSON-orange?style=for-the-badge)](https://stateless.co/hal_specification.html)

> **Módulo Auxiliar de Interoperabilidade Multiplataforma.**  
> API desenvolvida em .NET 10 atuando como nó de recepção e roteamento secundário terrestre no ecossistema ChronosDTN.

---

## 🚀 1. Arquitetura e Decisões de Design

O módulo .NET provê uma alternativa de comunicação e contingência multiplataforma. Ele compartilha das mesmas regras lógicas de roteamento espacial tolerante a falhas do ecossistema principal:

1.  **Persistência em Memória (EF Core InMemory)**:  
    Permite rodar simulações rápidas e limpas de transações e filas sem necessidade de configurar um banco Oracle ou SQL Server local dedicado no ambiente secundário.
2.  **Mapeamento de Modelos por Fluent API**:  
    As chaves primárias compostas do `Bundle` (`SourceNodeId` + `LocalSequenceId`) e as restrições relacionais são declaradas e validadas via Fluent API no `ChronosDbContext`, garantindo total paridade lógica com o Oracle DB da Fase 1.
3.  **Contrato HAL JSON**:  
    Todas as respostas REST da API seguem o formato de hipermídia **HAL JSON**, utilizando nós `_links` para expor a navegação de recursos de forma dinâmica para os clientes integradores.
4.  **Tratamento de Exceções (RFC 7807)**:  
    Um middleware intercepta erros internos e os encapsula no padrão da Web **RFC 7807 (ProblemDetails)**.

---

## 🛠️ 2. Tecnologias Utilizadas

*   **Framework**: ASP.NET Core Web API em .NET 10.0.
*   **Banco de Dados**: Entity Framework Core InMemory.
*   **Segurança**: Autenticação JwtBearer (HMAC SHA-256).
*   **Documentação**: Swashbuckle OpenAPI.

---

## 🏃 3. Como Executar

### 📋 3.1. Pré-requisitos
*   **.NET 10.0 SDK** instalado.

### ⚙️ 3.2. Executar a API
Abra o console do sistema na pasta do projeto C# e execute:
```bash
# Acessar a pasta do projeto
cd backend_net/ChronosDtn.InteropApi

# Restaurar dependências e rodar o servidor
dotnet run
```
A API iniciará localmente respondendo por padrão no endereço: **`http://localhost:5056`**

---

## 🔌 4. Teste e Validação Automatizada

Para simplificar a avaliação da banca, criamos um script em PowerShell (`verify_api.ps1`) que valida automaticamente o fluxo financeiro de ponta a ponta na API .NET:

1.  Abra o terminal na pasta `backend_net`.
2.  Execute o script ignorando a política de restrição local:
    ```powershell
    powershell -ExecutionPolicy Bypass -File verify_api.ps1
    ```

**O que o script faz**:
*   Realiza o login de login do operador (`operator` / `space_dtn_2026`).
*   Registra uma transferência internacional de créditos, que é enfileirada no buffer local como `BUFFERED` (Status `PENDING`).
*   Dispara o comando de transmissão de link físico `/api/bundles/transmit`.
*   Mostra os resultados finais comprovando que o bundle foi entregue (`DELIVERED`) e a transação liquidada (`SETTLED`).
