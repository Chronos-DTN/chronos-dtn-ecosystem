# ☕ ChronosDTN - Core Gateway Financeiro (Java Spring Boot 3.x)

[![Java 21](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
[![Spring Boot](https://img.shields.io/badge/spring_boot-3.2.5-brightgreen?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Lombok](https://img.shields.io/badge/Lombok-1.18.38-red?style=for-the-badge)](https://projectlombok.org)

> **Módulo Central do Roteador Financeiro Espacial.**  
> Gerencia a fila Store-and-Forward de pacotes e realiza a liquidação e reconciliação em banco relacional Oracle.

---

## 🚀 1. Decisões Arquiteturais e Padrões de Código

1.  **Mapeamento de Chaves Primárias Compostas (`BundleId`)**:
    Em redes interplanetárias que sofrem com latência de rádio severa, os nós na Lua não podem consultar de forma confiável geradores de sequências ou chaves automáticas na Terra. Por isso, a entidade `Bundle` utiliza um identificador composto (`BundleId`) com:
    *   `ID_NODE_SOURCE` (ID da Estação Operadora Emissora).
    *   `ID_BUNDLE` (Número sequencial incrementado e mantido localmente por nó).
    Isso assegura que novos bundles possam ser criados de forma independente e assíncrona por qualquer antena sem risco de colisões de chave durante a reconciliação.

2.  **Roteamento e Liquidação Diferida (DTN)**:
    *   *Mesmo Nó (Local)*: Se as contas de origem e destino pertencem à mesma estação, a transferência de saldo é efetuada na mesma hora (`SETTLED`) em contexto ACID.
    *   *Nós Distintos (Interplanetário)*: A API retém o valor da conta emissora na estação de origem para evitar gasto duplo (double spending), encapsula os dados transacionais em um Bundle com status `BUFFERED` e deixa a transação marcada como `PENDING` (Pendente).

3.  **Simulação de Janelas de Contato**:
    Ao chamar o endpoint `/api/bundles/transmit`, a API varre a tabela de enlaces orbitais (`TB_CHRONOS_LINK`). Se o status do link físico estiver ativo (`UP`), todos os pacotes em buffer são transmitidos, alterando seu estado para `DELIVERED`, e a API de destino processa a liquidação financeira nas contas remotas.

4.  **Tratamento de Exceções (RFC 7807)**:
    Caso ocorra saldo insuficiente ou contas inválidas, um manipulador global (`@RestControllerAdvice`) intercepta o erro e retorna uma resposta no padrão da Web **RFC 7807 (Problem Details)**, melhorando a experiência de depuração do cliente React Native.

---

## 🛠️ 2. Tecnologias e Configuração de Compilação

*   **Linguagem**: Java 21 (LTS).
*   **Framework**: Spring Boot 3.2.5.
*   **Persistência**: Spring Data JPA com Hibernate.
*   **Processamento de Anotações**: Lombok `1.18.38` (configurado explicitamente sob o plugin `maven-compiler-plugin` no `pom.xml` para assegurar o funcionamento dos getters e setters no Java 21).
*   **Hipermídia**: Spring HATEOAS (geração de links de hipermídia dinâmicos).
*   **Segurança**: Spring Security com autenticação stateless baseada em tokens JWT.

---

## 🏃 3. Como Executar Sem Docker (Localmente)

### 📋 3.1. Pré-requisitos
*   **Java JDK 21** instalado.
*   **Maven 3.8+** instalado.
*   Instância local do banco de dados (por padrão, a API utiliza o H2 em memória se o profile de banco Docker não estiver ativado).

### ⚙️ 3.2. Executar a Aplicação
Abra o console do sistema na pasta `backend_java` e execute:
```bash
# Compilar e baixar dependências
mvn clean compile

# Subir a aplicação Spring Boot
mvn spring-boot:run
```
A API subirá respondendo por padrão no endereço: **`http://localhost:8080`**

---

## 🔗 4. Resumo de Endpoints

### Autenticação (Pública)
*   `POST /api/auth/login`
    *   *Payload*: `{"username": "operator", "password": "space_dtn_2026"}`
    *   *Retorno*: Token JWT para inclusão no cabeçalho `Authorization: Bearer <token>`.

### Transações Financeiras (Protegidas)
*   `POST /api/transactions`: Solicita nova transferência de créditos (enfileira se for remoto).
*   `GET /api/transactions`: Lista as transações financeiras com links hipermídia.
*   `GET /api/transactions/{id}`: Detalha transação por ID.

### Roteamento DTN (Protegidas)
*   `GET /api/bundles`: Lista bundles em fila.
*   `POST /api/bundles/transmit`: Simula a ativação de rádio orbital, forçando o tráfego dos pacotes da fila Store-and-Forward e a liquidação no destino.

---

## 🔍 5. Depuração e OpenAPI

*   **Swagger OpenAPI UI**: Acesse **`http://localhost:8080/swagger-ui/index.html`** para testar os endpoints interativamente.
*   **Console do Banco H2**: Acesse `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:chronosdb`, Usuário: `sa`, Senha em branco) se rodando no modo standalone local.
