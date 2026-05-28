# Manual de Operação da Infraestrutura - ChronosDTN

Este diretório contém a infraestrutura de orquestração do ecossistema **ChronosDTN**, automatizando o provisionamento do banco de dados relacional **Oracle Database 23ai Free** e a conteinerização do microserviço **Spring Boot Java API** (Gateway Financeiro Principal).

---

## 🛠️ Arquitetura de Conteinerização

O ecossistema é orquestrado através de uma rede bridge isolada do Docker contendo dois serviços principais:

```
                  [ Rede Bridge Privada (chronos-net) ]
                                    │
    ┌───────────────────────────────┴──────────────────────────────┐
    │                                                              │
    ▼                                                              ▼
┌──────────────┐                                            ┌──────────────┐
│  chronos-api │ ──[ depends_on (service_healthy) ]───────> │  chronos-db  │
│ (Java API)   │                                            │ (Oracle DB)  │
└──────────────┘                                            └──────────────┘
    │ (Porta 8080)                                               │ (Porta 1521)
    ▼                                                            ▼
 [ Host Local ]                                               [ Host Local ]
```

### 1. Banco de Dados (`chronos-db`):
*   **Imagem**: `gvenzl/oracle-free:23-slim-faststart` (versão otimizada e slim do Oracle Database).
*   **Inicialização Automática**:
    *   `/container-entrypoint-initdb.d/00_init_user.sql`: Bloco SQL executado administrativamente como `SYS` para criar o usuário `CHRONOS` e conceder as permissões devidas.
    *   `/container-entrypoint-initdb.d/01_setup.sh`: Script bash intermediário que conecta via SQL*Plus sob a conta `CHRONOS` para rodar os arquivos acadêmicos na ordem correta: `schema.sql` ➔ `data.sql` ➔ `plsql.sql`.
*   **Volume**: Volume nomeado `oracle_data` mapeado para `/opt/oracle/oradata` para persistência permanente das transações e links espaciais.

### 2. Core API Gateway (`chronos-api`):
*   **Dockerfile**: Multi-stage build (`backend_java/Dockerfile`). Compila no container Maven (`maven:3.9.6-eclipse-temurin-17-alpine`) e executa em uma imagem JRE limpa (`eclipse-temurin:17-jre-alpine`).
*   **Segurança**: Executado sob usuário e grupo não-root (`dtnuser:dtngroup`, UID/GID 10001) em conformidade com as diretrizes CIS Docker e Kubernetes.
*   **Resiliência**: Possui checagem de integridade (healthcheck) de porta no banco de dados e só inicializa após o listener do Oracle responder queries com sucesso.

---

## 📋 Comandos Operacionais (Life Cycle)

Execute estes comandos na raiz do projeto (onde está localizado o arquivo `docker-compose.yml`):

### 1. Inicializar o Ecossistema (Modo Separado/Background)
Constrói as imagens customizadas da API Java e inicia os containers em segundo plano:
```bash
docker compose up -d --build
```
> [!NOTE]
> Na primeira execução, o Oracle Database criará os arquivos físicos do banco de dados na pasta do volume e carregará os scripts de carga. Isso pode levar de **30 a 60 segundos** dependendo do hardware do host.

### 2. Acompanhar a Inicialização e Logs
Para monitorar a saúde da API e o carregamento dos scripts de tabelas no banco de dados:
```bash
docker compose logs -f
```
Para ver apenas a API Java:
```bash
docker compose logs -f chronos-api
```

### 3. Verificar o Status dos Containers
Confirma se todos os containers estão saudáveis e rodando:
```bash
docker compose ps
```

### 4. Desligar a Infraestrutura
Para parar e remover os containers mantendo os dados salvos:
```bash
docker compose down
```
Para desligar removendo os volumes persistidos (limpeza total da base):
```bash
docker compose down -v
```

---

## 🔌 Portas e Conexões Locais

Após o carregamento completo do ecossistema, os seguintes serviços estarão disponíveis no Host local:

*   **API Spring Boot**: [http://localhost:8080](http://localhost:8080)
*   **Swagger OpenAPI UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
*   **Oracle Database Port**: `localhost:1521`
    *   **Service Name / PDB**: `FREEPDB1`
    *   **Usuário**: `CHRONOS`
    *   **Senha**: `ChronosPass123!`

---

## 🧪 Validação Rápida de Conectividade

Para validar se o container da API Java está operando com sucesso conectado ao banco Oracle persistido:

### Obter Token de Acesso (JWT)
Execute a chamada HTTP POST para simular o login do operador:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "SYSTEM", "password": "SYS"}'
```

*(Copie o token JWT retornado no campo `token`)*

### Consultar Contas Cadastradas (Oracle DB)
Substitua `<JWT_TOKEN>` pelo token retornado na chamada anterior:
```bash
curl -X GET http://localhost:8080/api/transactions \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Isso confirmará que a API Java conteinerizada está consultando os dados populados pelo script `data.sql` no container Oracle Database de forma 100% íntegra.
