# 🛠️ Manual de Operação da Infraestrutura - ChronosDTN

[![Docker Compose](https://img.shields.io/badge/docker_compose-v2+-blue?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Oracle Database](https://img.shields.io/badge/Oracle-Database_23ai-red?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/database/)
[![Alpine Linux](https://img.shields.io/badge/Alpine_Linux-3.19-blue?style=for-the-badge&logo=alpine&logoColor=white)](https://alpinelinux.org)

> **Módulo de Orquestração, Provisionamento de Contêineres e Scripts de Inicialização de Banco.**  
> Automatiza a subida da API Spring Boot (Java 21) e do Banco de Dados Oracle 23ai Free em rede virtual isolada.

---

## 🚀 1. Arquitetura de Conteinerização

O ecossistema ChronosDTN é executado sob uma rede privada do tipo *bridge* (`chronos-net`), o que permite que as APIs façam chamadas ao banco usando resolução de DNS interno pelo nome do serviço (`chronos-db`).

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
 [ Windows Host ]                                             [ Windows Host ]
```

### Detalhamento dos Componentes

#### A. Banco de Dados (`chronos-db`)
*   **Imagem Base**: `gvenzl/oracle-free:23-slim-faststart` (versão leve do banco de dados Oracle ideal para desenvolvimento rápido).
*   **Mecanismo de Bootstrap**:
    *   `/container-entrypoint-initdb.d/00_init_user.sql`: Script executado com permissões administrativas `SYS` para provisionar o usuário proprietário da solução (`CHRONOS`).
    *   `/container-entrypoint-initdb.d/01_setup.sh`: Script shell que conecta ao SQL*Plus utilizando o schema `CHRONOS` no PDB `FREEPDB1` e executa os scripts ordenados do banco (`schema.sql`, `data.sql`, `plsql.sql`).
*   **Volume**: O volume nomeado `oracle_data` mapeia os arquivos físicos de tabelas e logs no Host local, mantendo a integridade dos dados mesmo se o container for deletado.

#### B. API Gateway (`chronos-api`)
*   **Dockerfile**: Compilação multi-stage baseada no Maven com JDK 21 Alpine (`maven:3.9.6-eclipse-temurin-21-alpine`) e rodando em JRE leve (`eclipse-temurin:21-jre-alpine`).
*   **Segurança CIS Docker**: O contêiner cria e executa o processo sob o usuário **`dtnuser`** com ID não-root (`10001`), limitando drasticamente brechas de segurança por escalonamento de privilégios.
*   **Checagem de Saúde**: A API possui um `depends_on` condicionado à saúde do banco (`service_healthy`), aguardando que o listener do Oracle esteja totalmente operacional antes de abrir a porta HTTP.

---

## 📋 2. Comandos do Ciclo de Vida (Life Cycle)

Execute estes comandos na pasta raiz do repositório (onde está localizado o arquivo `docker-compose.yml`):

### 1. Iniciar o Ecossistema (Background)
Gera as imagens locais e inicia os contêineres:
```bash
docker compose up -d --build
```
> [!NOTE]
> Na primeira execução, o banco levará cerca de **30 a 60 segundos** para criar os arquivos físicos do Oracle e rodar as cargas. Nas execuções seguintes, a inicialização leva menos de 5 segundos devido ao *faststart* da imagem.

### 2. Monitoramento de Logs
Acompanhe o bootstrap e logs de execução em tempo real:
```bash
# Monitorar todos os contêineres
docker compose logs -f

# Monitorar apenas a API Java
docker compose logs -f chronos-api
```

### 3. Parar a Infraestrutura
Para desligar os contêineres e manter a base de dados salva no volume:
```bash
docker compose down
```
Para desligar **removendo os volumes físicos** (útil se quiser recomeçar o banco do zero):
```bash
docker compose down -v
```

---

## 🔌 3. Dados de Conexão no Host Local

*   **API Spring Boot**: [http://localhost:8080](http://localhost:8080)
*   **Documentação OpenAPI Swagger**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
*   **Conexão do Oracle Database**:
    *   **Host**: `localhost`
    *   **Porta**: `1521`
    *   **Service Name / PDB**: `FREEPDB1`
    *   **Usuário**: `CHRONOS`
    *   **Senha**: `ChronosPass123!`

---

## 🧪 4. Teste de Conectividade de Fila

Com a pilha rodando no Docker, você pode simular chamadas de rede no terminal utilizando comandos cURL:

### Passo 1: Autenticar o Operador
Solicita o token JWT à API Java:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "operator", "password": "space_dtn_2026"}'
```

*Copie a string alfanumérica retornada no campo `token`.*

### Passo 2: Listar Bundles do Roteador (Oracle DB)
Substitua `<JWT_TOKEN>` pelo token obtido no Passo 1:
```bash
curl -X GET http://localhost:8080/api/bundles \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Isso confirmará o tráfego de dados e leitura de filas diretamente da tabela `TB_CHRONOS_BUNDLE` no Oracle do contêiner.
