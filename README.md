# 🌌 ChronosDTN - Ecossistema de Roteamento Financeiro Espacial (Terra-Lua)

[![FIAP Global Solution](https://img.shields.io/badge/FIAP-Global%20Solution-blueviolet?style=for-the-badge)](https://www.fiap.com.br)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Java 21](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
[![.NET 10](https://img.shields.io/badge/.NET-10.0-blue?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com)
[![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactnative.dev)

> **Solução de Gateway Financeiro e Roteador de Rede Tolerante a Falhas e Atrasos (DTN) para a Economia Espacial.**
> Mapeado sob os rigorosos princípios de governança do framework **TOGAF v10** e modelado na notação **ArchiMate**.

---

## 🚀 1. Visão Geral do Ecossistema

O **ChronosDTN** é um ecossistema multiplataforma projetado para superar as barreiras de comunicação e transação em ambientes de espaço profundo. Diferente de sistemas terrestres, a infraestrutura orbital lida com conexões intermitentes e alta latência devido ao atraso da velocidade da luz (One-Way de ~1.28 segundos e RTT de ~2.56 segundos entre a Terra e a Lua).

A solução baseia-se na arquitetura **Store-and-Forward** do **Bundle Protocol (RFC 5050 / RFC 9171)**: as transações financeiras são encapsuladas e armazenadas em buffers locais até que janelas de contato físico (links de rádio) fiquem ativas, assegurando integridade e garantia de entrega de ponta a ponta.

---

## 📂 2. Mapa de Diretórios e Roteiro de Leitura

O projeto está estruturado de forma modular. Recomendamos a exploração na ordem abaixo:

```
chronos_dtn/
├── database/                    # [Fase 1] Módulo de Persistência Relacional & NoSQL
│   ├── schema.sql               # Estrutura de tabelas Oracle (DDL)
│   ├── data.sql                 # Carga de dados consistente (DML - 86 registros)
│   ├── plsql.sql                # Procedures procedurais de controle e processamento de rede
│   ├── queries.sql              # Relatórios de auditoria e latência orbital
│   └── README.md                # Arquitetura de dados relacional e mapeamento NoSQL JSON
├── backend_java/                # [Fase 2] API Core de Processamento Financeiro
│   ├── src/                     # Código Spring Boot 3.x com Spring Security e HATEOAS
│   ├── Dockerfile               # Arquivo de construção da imagem Java 21 Alpine
│   └── README.md                # Endpoints REST de Gateway e Swagger OpenAPI
├── backend_net/                 # [Fase 3] API de Interoperabilidade C#
│   ├── src/                     # Código Web API em .NET 8/10 com EF Core
│   └── README.md                # Roteiro de testes de interoperabilidade HAL JSON
├── frontend_mobile/             # [Fase 4] App Console do Operador (NCC)
│   ├── src/                     # Telas móveis React Native + Expo Router
│   └── README.md                # Instruções de emulação do NCC e design system aeroespacial
├── infra/                       # [Fase 5] DevOps e Orquestração Local
│   ├── init_db/                 # Scripts de bootstrap automático do banco de dados
│   └── README.md                # Guia de comandos operacionais e ciclo de vida Docker
├── governance/                  # [Fase 6] Governança Corporativa e Compliance
│   ├── ARCHITECTURE_TOGAF.md    # Especificação formal das fases ADM do TOGAF v10
│   └── README.md                # Regras de qualidade de software e compliance
└── docker-compose.yml           # Arquivo centralizador de orquestração de contêineres
```

---

## ⚙️ 3. Como Rodar o Ecossistema Completo (Passo a Passo)

### 📋 3.1. Pré-requisitos
*   **Docker Desktop** instalado e rodando.
*   **Node.js** (versão 18 ou superior).
*   **.NET 10 SDK** (apenas se for rodar o módulo .NET fora do Docker).
*   Portas **`8080`** (Java API), **`1521`** (Oracle DB) e **`8081/19000`** (React Native/Expo) liberadas no host.

---

### 🐳 3.2. Passo 1: Executar o Núcleo no Docker (Banco Oracle & API Java)
O banco de dados relacional e a API Core do Gateway rodam de forma conteinerizada.

1.  Abra o seu terminal (PowerShell ou Bash) na **raiz do projeto** (`C:\Users\maico\.gemini\antigravity\scratch\chronos_dtn`).
2.  Suba a infraestrutura em segundo plano:
    ```bash
    docker compose up -d --build
    ```
    *Nota: A compilação é executada em ambiente multi-stage e pode levar alguns segundos na primeira execução.*
3.  Acompanhe a inicialização do banco e a execução automática dos scripts SQL/PLSQL:
    ```bash
    docker compose logs -f chronos-db
    ```
    *Aguarde a mensagem indicando estado **healthy** (saudável).*
4.  Confirme se ambos os contêineres estão rodando ativamente com as portas mapeadas:
    ```bash
    docker compose ps
    ```
5.  Acesse a documentação interativa dos endpoints da API Java no navegador:
    *   👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

---

### 💻 3.3. Passo 2: Executar a API Secundária de Interoperabilidade (.NET)
A API .NET serve como roteador terreno secundário.

1.  Abra um novo terminal e acesse a pasta do módulo:
    ```bash
    cd backend_net
    ```
2.  Restaure as dependências e inicie o servidor:
    ```bash
    dotnet run --project src/ChronosDtn.InteropApi
    ```
    *A API iniciará localmente exposta na porta `http://localhost:5056` (ou porta informada no terminal).*
3.  (Opcional) Valide todas as rotas e o contrato HATEOAS HAL JSON rodando nosso script automático de testes no PowerShell:
    ```powershell
    ./verify_api.ps1
    ```

---

### 📱 3.4. Passo 3: Executar o Aplicativo Móvel (React Native & Expo)
O console do operador (NCC) para monitoramento de links e envio de créditos.

1.  Abra um terceiro terminal e acesse a pasta correspondente:
    ```bash
    cd frontend_mobile
    ```
2.  Instale os pacotes necessários:
    ```bash
    npm install
    ```
3.  Inicie o servidor do Expo em modo Web:
    ```bash
    npm run web
    ```
4.  Pressione `w` no terminal para forçar a abertura no navegador web, ou utilize o aplicativo **Expo Go** em seu celular escaneando o código QR impresso no console.

---

## 🛠️ 4. Solução de Problemas Comuns (Troubleshooting)

### ❌ Erro: `Bind for 0.0.0.0:8080 failed: port is already allocated`
*   **Causa**: Outro programa (servidor web local, contêiner antigo) está ocupando a porta 8080.
*   **Solução**:
    1.  No Windows, abra o PowerShell como Administrador e execute:
        ```powershell
        Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force
        ```
    2.  Ou execute `docker ps` e interrompa contêineres antigos rodando na mesma porta:
        ```bash
        docker stop nome_do_container_conflitante
        ```

### ❌ Erro: O Banco Oracle demora muito para subir na primeira vez
*   **Causa**: O Oracle Database Free precisa criar seus arquivos de dados em disco (`oracle_data`) e carregar os scripts na primeira inicialização.
*   **Solução**: É um comportamento esperado. A API Java possui um `healthcheck` inteligente (`depends_on`) e só inicializará quando o banco estiver 100% pronto.

### ❌ Erro de permissão de script PowerShell (`verify_api.ps1`)
*   **Causa**: Política de execução restrita do Windows PowerShell.
*   **Solução**: Execute o arquivo ignorando a política local:
    ```powershell
    powershell -ExecutionPolicy Bypass -File verify_api.ps1
    ```

---

## 🛡️ 5. Principais Robustezas Implementadas

1.  **Chaves Compostas Resilientes**: O identificador do Bundle é composto por `ID_NODE_SOURCE` + `NR_SEQUENCE`. Isso elimina a necessidade de um gerador central de ID global no rádio instável.
2.  **Segurança Criptográfica**: Assinaturas digitais de nó e integridade validada por hashes SHA-256 no payload.
3.  **Tratamento de Exceções**: Respostas no padrão de mercado **RFC 7807 (Problem Details)** em todas as APIs.
4.  **Isolamento e Segurança Docker**: Imagens Java compiladas em Alpine de forma multi-stage executando sob usuário `non-root` e com volumes locais persistidos.
