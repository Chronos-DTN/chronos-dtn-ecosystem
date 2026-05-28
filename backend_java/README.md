# ChronosDTN - Core Gateway Financeiro (Java Spring Boot 3.x)

Este diretório contém a API Principal e Core Engine do ecossistema **ChronosDTN**, projetada para rodar nas estações espaciais terrestres e lunares (Ex: Houston Ground Station e Artemis Base Alpha). 

A solução atua como um **Gateway Financeiro** e gerenciador de filas **Store-and-Forward** em conformidade conceitual com o **Bundle Protocol (RFC 5050 / RFC 9171)** para redes tolerantes a atrasos (DTN).

---

## 🚀 Arquitetura e Decisões de Design

1. **JPA e Chave Composta Resiliente (`BundleId`)**:
   Em redes espaciais distribuídas sem conexão de baixa latência em tempo real, as bases lunares não podem consultar sequenciadores de banco de dados centralizados na Terra para obter IDs. Por isso, a entidade `Bundle` adota uma chave primária composta (`BundleId`) contendo:
   - `ID_NODE_SOURCE` (ID da Estação Operacional).
   - `ID_BUNDLE` (Sequencial incremental gerado localmente na própria estação).
   Essa combinação é globalmente exclusiva e evita colisões durante reconciliações posteriores.

2. **Liquidação Financeira Diferida (DTN/Rádio)**:
   - **Transação no mesmo nó**: Se a conta de origem e a de destino residem na mesma estação, a transação é liquidada imediatamente (`SETTLED`), atualizando os saldos na mesma hora e gerando um bundle com status `DELIVERED`.
   - **Transação interplanetária**: Se a conta de destino reside em outro nó, a API debita o valor da conta de origem (evitando double spending) e enfileira um pacote com status `BUFFERED`. A transação fica marcada como `PENDING`.

3. **Simulação de Handshake e Roteamento**:
   Ao chamar o endpoint `/api/bundles/transmit`, o sistema busca janelas de contato de rádio ativas (`ST_LINK = 'UP'`) e despacha os bundles da fila correspondente, marcando-os como `DELIVERED`. Em seguida, o serviço de transações reconcilia e aplica os créditos nas contas de destino remotas, alterando as transações para `SETTLED`.

4. **Tratamento Global de Erros (RFC 7807)**:
   Exceções como `InsufficientFundsException` e `ResourceNotFoundException` são mapeadas via `@RestControllerAdvice` e retornam payloads padronizados com o formato de detalhes do problema da web (Problem Details).

5. **Segurança JWT Stateless**:
   Rotas financeiras operacionais exigem autenticação do operador via cabeçalho `Authorization: Bearer <JWT>`. A rota do console de banco H2 e a documentação do Swagger estão liberadas para simplificar o desenvolvimento.

---

## 🛠️ Tecnologias Utilizadas

- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Data JPA & Hibernate**
- **Spring Security & JWT (Hmac256)**
- **Spring HATEOAS (Hypermedia Links)**
- **Springdoc-OpenAPI & Swagger UI**
- **Banco em Memória H2**

---

## 📥 Pré-requisitos de Execução

- Ter o Java JDK 17 (ou superior) instalado.
- Ter o Maven instalado (ou utilizar o wrapper `./mvnw` se fornecido).

---

## 💻 Como Compilar e Executar

Execute os comandos abaixo na raiz do diretório `backend_java`:

```bash
# 1. Compilar o projeto
mvn clean compile

# 2. Executar testes e subir o servidor de desenvolvimento
mvn spring-boot:run
```

O servidor inicializará na porta **8080** por padrão.

---

## 📍 Endpoints e Rotas Disponíveis

### 1. Autenticação Operacional (Pública)
*   `POST /api/auth/login`
    *   **Payload de entrada (`LoginRequest`):**
        ```json
        {
          "username": "operator",
          "password": "space_dtn_2026"
        }
        ```
    *   **Retorno (`TokenResponse`):** Retorna o JWT que deve ser enviado nas requisições protegidas.

### 2. Transações Financeiras (Protegido por JWT)
*   `GET /api/transactions`: Lista todas as transações (incluindo links HATEOAS para o bundle de transporte).
*   `GET /api/transactions/{id}`: Detalha uma transação por ID.
*   `POST /api/transactions`: Solicita uma nova transferência de créditos interestelares.
    *   **Payload de entrada (`TransactionRequest`):**
        ```json
        {
          "sourceAccountId": 101,
          "destAccountId": 201,
          "amount": 2500.00,
          "priority": 2
        }
        ```

### 3. Fila de Roteamento DTN (Protegido por JWT)
*   `GET /api/bundles`: Consulta todos os pacotes em fila ou transmitidos.
*   `GET /api/bundles/{sourceNodeId}/{localSequenceId}`: Detalha um bundle específico pela PK composta.
*   `POST /api/bundles/transmit`: Simula a abertura de janelas de contato físico, transmitindo bundles e reconciliando transações pendentes no destino.

---

## 📊 Carga Inicial de Dados (Seed Automático)

Para permitir testes imediatos em ambiente de desenvolvimento, a API popula o H2 automaticamente na inicialização com os seguintes dados:

- **Nó 1 (Houston Ground Station)** - Estação Física na Terra (ID: 1).
- **Nó 2 (Artemis Base Alpha)** - Estação Física na Lua (ID: 2).
- **Conta 101 (Terra)** - Titular: "Houston Ground Station Account" | Saldo: $500,000.00 USD.
- **Conta 201 (Lua)** - Titular: "Shackleton Mining Corp Account" | Saldo: $150,000.00 LUN.
- **Conta 202 (Lua)** - Titular: "Lunar Habitat Utilities Account" | Saldo: $25,000.00 LUN.
- **Link 1 (Terra -> Lua)** - Janela de rádio ativa programada com latência real de ~1.28 segundos.

---

## 🔍 Ferramentas de Monitoramento e Testes

- **Console do H2**: Acesse `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:chronosdb`, User: `sa`, Senha em branco).
- **Swagger UI (OpenAPI 3.0)**: Acesse `http://localhost:8080/swagger-ui.html` para testar os endpoints interativamente.
