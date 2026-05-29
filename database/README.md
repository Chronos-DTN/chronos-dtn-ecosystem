# 💾 ChronosDTN - Módulo de Persistência Relacional (Oracle DB) e NoSQL

[![Oracle Database](https://img.shields.io/badge/Oracle-Database_23ai-red?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/database/)
[![SQL DDL](https://img.shields.io/badge/Language-SQL_DDL-blue?style=for-the-badge)](https://en.wikipedia.org/wiki/Data_definition_language)
[![PL/SQL](https://img.shields.io/badge/Language-PL%2FSQL-orange?style=for-the-badge)](https://en.wikipedia.org/wiki/PL/SQL)

> **Camada de Dados Central do Roteador e Gateway Financeiro Espacial.**  
> Implementa o modelo transacional relacional ACID e a conceituação de filas Store-and-Forward documental (NoSQL JSON).

---

## 🚀 1. Modelagem Híbrida de Dados

Para lidar com os desafios físicos do espaço profundo (perda constante de sinal e atrasos de sinal rádio), o ChronosDTN adota uma **arquitetura híbrida**:

1.  **Modelo Relacional (Oracle DB)**:  
    Garante integridade contábil e consistência transacional rígida (**ACID**) para liquidação de contas, saldos e logs de auditoria na Terra e na Lua, evitando gasto duplo ou inconsistências de saldo.
2.  **Modelo Documental (NoSQL JSON)**:  
    Representa o encapsulamento físico do Bundle (RFC 9171) no rádio-link. Os gateways remotos serializam as transações locais em documentos JSON autossuficientes e assinados criptograficamente. Esses documentos são retidos na fila em disco até a abertura da janela de rádio (Store-and-Forward).

---

## 📁 2. Diagrama de Relacionamento (Entity-Relationship)

```mermaid
erDiagram
    %% Por que: Mapeamento de relacionamentos lógicos do banco de dados na notação Crow's Foot.
    TB_CHRONOS_NODE ||--o{ TB_CHRONOS_LINK : "origem/destino"
    TB_CHRONOS_NODE ||--o{ TB_CHRONOS_ACCOUNT : "hospeda"
    TB_CHRONOS_NODE ||--o{ TB_CHRONOS_BUNDLE : "emite/recebe"
    TB_CHRONOS_LINK ||--o{ TB_CHRONOS_SYNC_LOG : "audita"
    TB_CHRONOS_BUNDLE ||--|| TB_CHRONOS_TRANSACTION : "carrega"
    TB_CHRONOS_ACCOUNT ||--o{ TB_CHRONOS_TRANSACTION : "debito/credito"
```

---

## 📋 3. Roteiro dos Arquivos de Dados

Os scripts devem ser executados na ordem abaixo:

1.  **[schema.sql](file:///C:/Users/maico/.gemini/antigravity/scratch/chronos_dtn/database/schema.sql)**:  
    Contém os comandos DDL de criação das 6 tabelas, chaves primárias, estrangeiras e restrições de validação (`CHECK`) de saldo e prioridade.
2.  **[data.sql](file:///C:/Users/maico/.gemini/antigravity/scratch/chronos_dtn/database/data.sql)**:  
    Popula o banco com 86 registros mocks altamente consistentes simulando o tráfego espacial em uma janela de 30 dias.
3.  **[plsql.sql](file:///C:/Users/maico/.gemini/antigravity/scratch/chronos_dtn/database/plsql.sql)**:  
    Cria as procedures de roteamento de filas, atualização de saldos, logs de sincronia, expurgo de TTLs vencidos e taxas cambiais automáticas.
4.  **[queries.sql](file:///C:/Users/maico/.gemini/antigravity/scratch/chronos_dtn/database/queries.sql)**:  
    Contém 5 relatórios avançados de auditoria cruzando tabelas com JOINs, agregações e subconsultas.

---

## 🛡️ 4. Guia de Defesa Acadêmica (Blindagem de Banca)

> [!NOTE]
> Esta seção foi projetada sob medida para blindar o projeto acadêmico contra questionamentos difíceis dos avaliadores.

*   **Pergunta 1**: *"Por que escolheram uma modelagem híbrida relacional com NoSQL em vez de usar apenas NoSQL de ponta a ponta no Gateway?"*
    *   **Defesa**: Operações financeiras não aceitam consistência eventual no nível de liquidação central. Usar NoSQL de ponta a ponta nos exporia ao teorema CAP: sacrificando consistência em prol de partição. Nossa arquitetura usa o NoSQL de forma tática como um buffer temporário rápido para enfileirar bundles de transporte no rádio, enquanto o banco relacional na Terra e na Lua gerencia o estado consolidado das contas financeiras com transações ACID rígidas.
*   **Pergunta 2**: *"Como o banco trata a latência física orbital e a perda constante de sinal rádio?"*
    *   **Defesa**: O banco possui tabelas de controle de filas (`TB_CHRONOS_BUNDLE`) e contact plans (`TB_CHRONOS_LINK`). As transações entram em estado `PENDING` e o respectivo bundle em `BUFFERED`. Através da lógica PL/SQL programada, as transações só são promovidas a `SETTLED` (Liquidadas) quando o bundle que as carrega é entregue no nó destino (`DELIVERED`) e a rotina de reconciliação de links confirma a integridade dos dados. Se o pacote estourar o tempo máximo de vida (`DT_EXPIRY` / TTL), a lógica PL/SQL de expurgamento desfaz a transação e marca a operação como `REJECTED`, estornando os créditos.
*   **Pergunta 3**: *"Para que servem os campos `TX_HASH` e `TX_PAYLOAD` na tabela de Bundles?"*
    *   **Defesa**: O espaço profundo está sujeito a altos níveis de radiação ionizante que provocam bit flips nas memórias flash e transmissões eletromagnéticas. O `TX_HASH` guarda o checksum SHA-256 gerado na origem. O nó receptor recalcula o hash. Se divergirem, o pacote é descartado, forçando retransmissão automatizada via PL/SQL. O payload imutável também armazena assinaturas digitais do remetente, prevenindo contra ataques cibernéticos de spoofing ou injeção de ordens financeiras falsas na Lua.
