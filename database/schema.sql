-- =============================================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS (DDL) - ECOSSISTEMA CHRONOSDTN
-- PROPÓSITO: Definir a modelagem física relacional para o Gateway Financeiro e Roteador Espacial.
-- AUTOR: Arquiteto de Sistemas Principal & Engenheiro de Software Sênior
-- =============================================================================

-- =============================================================================
-- EXCLUSÃO PREVENTIVA DE TABELAS (DROP TABLES)
-- POR QUE: Garante a reexecução limpa do script de banco de dados eliminando
-- dependências na ordem reversa das restrições de integridade referencial.
-- =============================================================================
BEGIN
    -- Por que: Executado como bloco anônimo dinâmico para evitar erros se as tabelas não existirem.
    EXECUTE IMMEDIATE 'DROP TABLE TB_CHRONOS_SYNC_LOG CASCADE CONSTRAINTS';
EXCEPTION
    -- Por que: Silencia o erro ORA-00942 (tabela não existe) se for a primeira execução do script.
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    -- Por que: Remove a tabela de operadores na inicialização se ela já existir.
    EXECUTE IMMEDIATE 'DROP TABLE TB_CHRONOS_OPERATOR CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TB_CHRONOS_TRANSACTION CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TB_CHRONOS_BUNDLE CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TB_CHRONOS_ACCOUNT CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TB_CHRONOS_LINK CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TB_CHRONOS_NODE CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/


-- =============================================================================
-- 1. TABELA: TB_CHRONOS_NODE
-- POR QUE: Representa as estações físicas terrestres, bases lunares ou satélites
-- que atuam como roteadores do sinal de rede DTN (Delay-Tolerant Networking).
-- =============================================================================
CREATE TABLE TB_CHRONOS_NODE (
    -- Por que: Identificador numérico primário do nó. Usamos NUMBER para máxima compatibilidade corporativa com Oracle.
    ID_NODE NUMBER(10) NOT NULL,
    -- Por que: Nome da base espacial ou estação terrestre (ex: NASA White Sands, Moon Base Alpha).
    NM_NODE VARCHAR2(50) NOT NULL,
    -- Por que: Descrição geográfica/orbital para rotas dinâmicas.
    DS_LOCATION VARCHAR2(50) NOT NULL,
    -- Por que: Controla o estado de operação (ACTIVE, INACTIVE ou DEGRADED).
    ST_NODE VARCHAR2(20) NOT NULL,
    -- Por que: Define a chave primária da tabela para busca indexada e integridade da entidade.
    CONSTRAINT PK_CHRONOS_NODE PRIMARY KEY (ID_NODE),
    -- Por que: Garante que não teremos nomes de nós idênticos, preservando a legibilidade.
    CONSTRAINT UN_CHRONOS_NODE_NAME UNIQUE (NM_NODE),
    -- Por que: Restringe valores de status a um domínio predefinido e confiável no nível do banco.
    CONSTRAINT CK_CHRONOS_NODE_STATUS CHECK (ST_NODE IN ('ACTIVE', 'INACTIVE', 'DEGRADED'))
);

-- =============================================================================
-- 2. TABELA: TB_CHRONOS_LINK
-- POR QUE: Armazena o planejamento dos contatos físicos (Contact Plan). Como no
-- espaço profundo os corpos orbitam, a visibilidade de rádio tem horário de início/fim.
-- =============================================================================
CREATE TABLE TB_CHRONOS_LINK (
    -- Por que: Identificador único do enlace.
    ID_LINK NUMBER(10) NOT NULL,
    -- Por que: Origem da transmissão orbital.
    ID_NODE_SOURCE NUMBER(10) NOT NULL,
    -- Por que: Destino da transmissão orbital.
    ID_NODE_DEST NUMBER(10) NOT NULL,
    -- Por que: Horário exato que o enlace de rádio fica disponível para envio de dados.
    DT_START TIMESTAMP NOT NULL,
    -- Por que: Horário de encerramento do contato orbital.
    DT_END TIMESTAMP NOT NULL,
    -- Por que: Largura de banda em Kbps suportada pelo sinal.
    VL_BANDWIDTH_KBPS NUMBER(12,2) NOT NULL,
    -- Por que: Tempo de propagação do sinal devido à velocidade da luz (segundos). Ex: Terra-Lua = ~1.28s.
    VL_LATENCY_SECONDS NUMBER(8,3) NOT NULL,
    -- Por que: Estado operacional instantâneo (UP, DOWN, SCHEDULED).
    ST_LINK VARCHAR2(20) NOT NULL,
    -- Por que: Define a PK da tabela de janelas de contato.
    CONSTRAINT PK_CHRONOS_LINK PRIMARY KEY (ID_LINK),
    -- Por que: Integridade referencial vinculando o nó emissor.
    CONSTRAINT FK_CHRONOS_LINK_NODE_SRC FOREIGN KEY (ID_NODE_SOURCE) REFERENCES TB_CHRONOS_NODE (ID_NODE),
    -- Por que: Integridade referencial vinculando o nó receptor.
    CONSTRAINT FK_CHRONOS_LINK_NODE_DST FOREIGN KEY (ID_NODE_DEST) REFERENCES TB_CHRONOS_NODE (ID_NODE),
    -- Por que: Validação lógica para impedir que a janela acabe antes de iniciar.
    CONSTRAINT CK_CHRONOS_LINK_DATES CHECK (DT_END > DT_START),
    -- Por que: Garante banda positiva.
    CONSTRAINT CK_CHRONOS_LINK_BANDWIDTH CHECK (VL_BANDWIDTH_KBPS > 0),
    -- Por que: Garante latência positiva.
    CONSTRAINT CK_CHRONOS_LINK_LATENCY CHECK (VL_LATENCY_SECONDS >= 0),
    -- Por que: Controla domínios rígidos para status operacional do link.
    CONSTRAINT CK_CHRONOS_LINK_STATUS CHECK (ST_LINK IN ('UP', 'DOWN', 'SCHEDULED'))
);

-- =============================================================================
-- 3. TABELA: TB_CHRONOS_ACCOUNT
-- POR QUE: Mantém o registro do saldo e moedas das instituições baseadas nas
-- colônias e na Terra, permitindo a verificação de créditos em ambiente distribuído.
-- =============================================================================
CREATE TABLE TB_CHRONOS_ACCOUNT (
    -- Por que: Código da conta financeira do cliente lunar/terrestre.
    ID_ACCOUNT NUMBER(10) NOT NULL,
    -- Por que: Nó de processamento que gerencia esta conta de forma primária.
    ID_NODE NUMBER(10) NOT NULL,
    -- Por que: Nome da instituição, governo ou empresa (ex: Shackleton Mining, SpaceX, ESA).
    NM_HOLDER VARCHAR2(100) NOT NULL,
    -- Por que: Saldo financeiro com precisão decimal adequada para operações monetárias.
    VL_BALANCE NUMBER(15,2) NOT NULL,
    -- Por que: Sigla monetária para operações internacionais/interplanetárias (ex: USD, LUN).
    NM_CURRENCY VARCHAR2(10) NOT NULL,
    -- Por que: Define a chave primária da conta.
    CONSTRAINT PK_CHRONOS_ACCOUNT PRIMARY KEY (ID_ACCOUNT),
    -- Por que: Associa a conta ao seu nó de liquidação local na rede espacial.
    CONSTRAINT FK_CHRONOS_ACCOUNT_NODE FOREIGN KEY (ID_NODE) REFERENCES TB_CHRONOS_NODE (ID_NODE),
    -- Por que: Garante que não teremos saldos inconsistentes (admitindo limite de crédito negativo controlado).
    CONSTRAINT CK_CHRONOS_ACCOUNT_BALANCE CHECK (VL_BALANCE >= -1000000.00)
);

-- =============================================================================
-- 4. TABELA: TB_CHRONOS_BUNDLE
-- POR QUE: O Bundle é o pacote básico de rede do protocolo DTN (RFC 5050 / RFC 9171). 
-- Funciona como buffer persistente local nas filas do modelo Store-and-Forward.
-- =============================================================================
CREATE TABLE TB_CHRONOS_BUNDLE (
    -- Por que: ID absoluto do bundle na rede global.
    ID_BUNDLE NUMBER(10) NOT NULL,
    -- Por que: Ponto geográfico de envio inicial.
    ID_NODE_SOURCE NUMBER(10) NOT NULL,
    -- Por que: Ponto geográfico de recebimento final.
    ID_NODE_DEST NUMBER(10) NOT NULL,
    -- Por que: Carga útil criptografada serializada (mensagens, hashes, assinaturas digitais).
    TX_PAYLOAD CLOB NOT NULL,
    -- Por que: Hash criptográfico SHA-256 para checagem rápida de integridade física.
    TX_HASH VARCHAR2(64) NOT NULL,
    -- Por que: Prioridade de roteamento DTN (0 = Baixa/Telemetria, 1 = Média/Dados, 2 = Alta/Financeira).
    NR_PRIORITY NUMBER(1) NOT NULL,
    -- Por que: Estado do bundle na rede (BUFFERED, IN_TRANSIT, DELIVERED, EXPIRED).
    ST_TRANSMISSION VARCHAR2(20) NOT NULL,
    -- Por que: Quando o pacote foi criado no nó de origem.
    DT_CREATED TIMESTAMP NOT NULL,
    -- Por que: Tempo máximo de vida útil (Time To Live). Após este prazo, o bundle é expurgado.
    DT_EXPIRY TIMESTAMP NOT NULL,
    -- Por que: Chave primária da tabela de controle do buffer DTN.
    CONSTRAINT PK_CHRONOS_BUNDLE PRIMARY KEY (ID_BUNDLE),
    -- Por que: Referência ao nó de origem da rede.
    CONSTRAINT FK_CHRONOS_BUNDLE_NODE_SRC FOREIGN KEY (ID_NODE_SOURCE) REFERENCES TB_CHRONOS_NODE (ID_NODE),
    -- Por que: Referência ao nó de destino da rede.
    CONSTRAINT FK_CHRONOS_BUNDLE_NODE_DST FOREIGN KEY (ID_NODE_DEST) REFERENCES TB_CHRONOS_NODE (ID_NODE),
    -- Por que: Garante integridade temporal do Time to Live (TTL).
    CONSTRAINT CK_CHRONOS_BUNDLE_TTL CHECK (DT_EXPIRY > DT_CREATED),
    -- Por que: Validação dos níveis de prioridade válidos.
    CONSTRAINT CK_CHRONOS_BUNDLE_PRIORITY CHECK (NR_PRIORITY IN (0, 1, 2)),
    -- Por que: Validação dos estados do protocolo de transporte espacial.
    CONSTRAINT CK_CHRONOS_BUNDLE_STATUS CHECK (ST_TRANSMISSION IN ('BUFFERED', 'IN_TRANSIT', 'DELIVERED', 'EXPIRED'))
);

-- =============================================================================
-- 5. TABELA: TB_CHRONOS_TRANSACTION
-- POR QUE: Registra as operações financeiras reais contidas e transportadas pelos
-- bundles orbitais, ligando as contas de débito/crédito interplanetárias.
-- =============================================================================
CREATE TABLE TB_CHRONOS_TRANSACTION (
    -- Por que: Identificador único da transação financeira.
    ID_TRANSACTION NUMBER(10) NOT NULL,
    -- Por que: Ligação direta com o bundle físico que transportou esta operação pela rede DTN.
    ID_BUNDLE NUMBER(10) NOT NULL,
    -- Por que: Conta debitada na transação.
    ID_ACCOUNT_SOURCE NUMBER(10) NOT NULL,
    -- Por que: Conta creditada na transação.
    ID_ACCOUNT_DEST NUMBER(10) NOT NULL,
    -- Por que: Valor monetário da operação financeira.
    VL_AMOUNT NUMBER(15,2) NOT NULL,
    -- Por que: Data/Hora exata do processamento local da transação.
    DT_TRANSACTION TIMESTAMP NOT NULL,
    -- Por que: Status de conciliação bancária espacial (PENDING, SETTLED, REJECTED).
    ST_SETTLEMENT VARCHAR2(20) NOT NULL,
    -- Por que: Define a chave primária da transação financeira.
    CONSTRAINT PK_CHRONOS_TRANSACTION PRIMARY KEY (ID_TRANSACTION),
    -- Por que: Integridade referencial ligando a transação ao seu meio de transporte espacial (Bundle).
    CONSTRAINT FK_CHRONOS_TX_BUNDLE FOREIGN KEY (ID_BUNDLE) REFERENCES TB_CHRONOS_BUNDLE (ID_BUNDLE),
    -- Por que: Integridade referencial vinculando a conta de origem dos fundos.
    CONSTRAINT FK_CHRONOS_TX_ACCT_SRC FOREIGN KEY (ID_ACCOUNT_SOURCE) REFERENCES TB_CHRONOS_ACCOUNT (ID_ACCOUNT),
    -- Por que: Integridade referencial vinculando a conta de destino dos fundos.
    CONSTRAINT FK_CHRONOS_TX_ACCT_DST FOREIGN KEY (ID_ACCOUNT_DEST) REFERENCES TB_CHRONOS_ACCOUNT (ID_ACCOUNT),
    -- Por que: Garante que transferências financeiras tenham valor estritamente positivo.
    CONSTRAINT CK_CHRONOS_TX_AMOUNT CHECK (VL_AMOUNT > 0),
    -- Por que: Domínio de segurança para evitar estados de transação inválidos.
    CONSTRAINT CK_CHRONOS_TX_STATUS CHECK (ST_SETTLEMENT IN ('PENDING', 'SETTLED', 'REJECTED'))
);

-- =============================================================================
-- 6. TABELA: TB_CHRONOS_SYNC_LOG
-- POR QUE: Loga as atividades de sincronização automatizadas após o fechamento e
-- abertura de canais orbitais de comunicação rádio. Essencial para auditoria bancária.
-- =============================================================================
CREATE TABLE TB_CHRONOS_SYNC_LOG (
    -- Por que: ID único do log de reconciliação.
    ID_LOG NUMBER(10) NOT NULL,
    -- Por que: Link de rede espacial utilizado na transmissão dos dados.
    ID_LINK NUMBER(10) NOT NULL,
    -- Por que: Instante que a auditoria/sincronia do canal de rádio foi finalizada.
    DT_SYNC TIMESTAMP NOT NULL,
    -- Por que: Total de bundles que conseguiram trafegar no link de forma íntegra.
    QT_BUNDLES_SENT NUMBER(8) NOT NULL,
    -- Por que: Número de pacotes que falharam e exigiram retransmissão por perda de rádio.
    QT_ERRORS NUMBER(6) NOT NULL,
    -- Por que: Estado final da rotina de sincronização (SUCCESS, PARTIAL, FAILED).
    ST_SYNC VARCHAR2(20) NOT NULL,
    -- Por que: PK do log de auditoria.
    CONSTRAINT PK_CHRONOS_SYNC_LOG PRIMARY KEY (ID_LOG),
    -- Por que: Link associado ao log.
    CONSTRAINT FK_CHRONOS_SYNC_LOG_LINK FOREIGN KEY (ID_LINK) REFERENCES TB_CHRONOS_LINK (ID_LINK),
    -- Por que: Impede valores negativos de contagem de pacotes.
    CONSTRAINT CK_CHRONOS_SYNC_BUNDLES CHECK (QT_BUNDLES_SENT >= 0),
    -- Por que: Impede contagem negativa de falhas físicas.
    CONSTRAINT CK_CHRONOS_SYNC_ERRORS CHECK (QT_ERRORS >= 0),
    -- Por que: Limita os domínios do status de sincronia do lote.
    CONSTRAINT CK_CHRONOS_SYNC_STATUS CHECK (ST_SYNC IN ('SUCCESS', 'PARTIAL', 'FAILED'))
);

-- =============================================================================
-- 7. TABELA: TB_CHRONOS_OPERATOR
-- POR QUE: Armazena as credenciais de operadores autorizados no ecossistema
-- financeiro espacial, com relacionamento opcional a nós (estações).
-- =============================================================================
CREATE TABLE TB_CHRONOS_OPERATOR (
    -- Por que: Identificador numérico primário do operador, gerado automaticamente como Identity.
    ID_OPERATOR NUMBER(10) GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    -- Por que: Nome de login único do operador.
    NM_USERNAME VARCHAR2(50) NOT NULL,
    -- Por que: Senha criptografada (BCrypt) para login seguro.
    TX_PASSWORD VARCHAR2(100) NOT NULL,
    -- Por que: Nome completo do operador.
    NM_FULLNAME VARCHAR2(100) NOT NULL,
    -- Por que: Vínculo opcional ao nó (ex: se o operador trabalha em Houston).
    ID_NODE NUMBER(10) NULL,
    -- Por que: Define a chave primária.
    CONSTRAINT PK_CHRONOS_OPERATOR PRIMARY KEY (ID_OPERATOR),
    -- Por que: Garante nomes de login exclusivos.
    CONSTRAINT UN_CHRONOS_OPERATOR_USER UNIQUE (NM_USERNAME),
    -- Por que: Associa o operador ao seu nó de controle espacial.
    CONSTRAINT FK_CHRONOS_OPERATOR_NODE FOREIGN KEY (ID_NODE) REFERENCES TB_CHRONOS_NODE (ID_NODE)
);

-- =============================================================================
-- INDICES OTIMIZADORES (PERFORMANCE DE ROTA E BUSCA)
-- POR QUE: Gateways espaciais precisam de tempo de resposta na escala de microsegundos
-- para rotear bundles e verificar limites antes da perda de sinal.
-- =============================================================================

-- Por que: Acelera a consulta de links de conectividade orbital baseada em datas no Contact Plan.
CREATE INDEX IDX_CHRONOS_LINK_DATES ON TB_CHRONOS_LINK (DT_START, DT_END);

-- Por que: Otimiza a busca na fila Store-and-Forward por prioridade e status de transmissão.
CREATE INDEX IDX_CHRONOS_BUNDLE_ROUTING ON TB_CHRONOS_BUNDLE (ST_TRANSMISSION, NR_PRIORITY);

-- Por que: Facilita a auditoria de transações não conciliadas de alto valor.
CREATE INDEX IDX_CHRONOS_TX_PENDING ON TB_CHRONOS_TRANSACTION (ST_SETTLEMENT, VL_AMOUNT);

exit;
