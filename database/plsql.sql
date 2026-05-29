-- =============================================================================
-- SCRIPTS PROCEDURAIS (PL/SQL) - ECOSSISTEMA CHRONOSDTN
-- PROPÓSITO: Implementar lógica operacional do gateway financeiro e roteador rádio.
-- AUTOR: Arquiteto de Sistemas Principal & Engenheiro de Software Sênior
-- =============================================================================

SET SERVEROUTPUT ON;

-- =============================================================================
-- BLOCO ANÔNIMO 1: CADASTRO E VERIFICAÇÃO DE NOVO NÓ DE REDE ESPACIAL
-- LOGICA: SELECT INTO, Cursor Explícito, Estrutura Condicional, Exception Handling.
-- =============================================================================
DECLARE
    -- Por que: Variável para armazenar o ID do nó a ser verificado ou criado.
    v_node_id TB_CHRONOS_NODE.ID_NODE%TYPE := 7;
    -- Por que: Nome do novo nó de rede a ser cadastrado.
    v_node_name TB_CHRONOS_NODE.NM_NODE%TYPE := 'Deep Space Gateway station';
    -- Por que: Localização física no espaço orbital.
    v_node_loc TB_CHRONOS_NODE.DS_LOCATION%TYPE := 'Órbita Lunar - L1 Lagrange';
    -- Por que: Status inicial de funcionamento.
    v_node_status TB_CHRONOS_NODE.ST_NODE%TYPE := 'ACTIVE';
    -- Por que: Contador numérico para validar se o registro já existe no banco.
    v_exists NUMBER(1) := 0;
    
    -- Por que: Cursor explícito para buscar nós com nomes similares e evitar duplicações.
    -- (Cursor Explícito 1)
    CURSOR cur_search_node(p_name VARCHAR2) IS
        SELECT ID_NODE
        FROM TB_CHRONOS_NODE
        WHERE UPPER(NM_NODE) = UPPER(p_name);
        
    -- Por que: Registro de tipo para receber os dados do cursor de forma tipada.
    v_search_rec cur_search_node%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== BLOCO 1: CADASTRO DE NÓS DE REDE ===');
    
    -- Por que: Abrimos o cursor explícito passando o nome do nó como argumento.
    OPEN cur_search_node(v_node_name);
    
    -- Por que: Capturamos a primeira linha do cursor buscando compatibilidade de nomes.
    FETCH cur_search_node INTO v_search_rec;
    
    -- Por que: Condicional IF para verificar se o cursor encontrou algum registro correspondente.
    -- (Estrutura Condicional 1)
    IF cur_search_node%FOUND THEN
        -- Por que: Informa que o nó já existe no catálogo e impede o insert duplicado.
        DBMS_OUTPUT.PUT_LINE('Nó de Rede "' || v_node_name || '" já está cadastrado no sistema. ID: ' || v_search_rec.ID_NODE);
        v_exists := 1;
    ELSE
        -- Por que: Caso o nó não exista, o flag permanece zero para permitir a criação.
        v_exists := 0;
    END IF;
    
    -- Por que: Fechamos o cursor aberto para liberar recursos de memória do servidor Oracle.
    CLOSE cur_search_node;
    
    -- Por que: Nova condicional para proceder com a inserção se o nó for inédito.
    IF v_exists = 0 THEN
        -- Por que: Insere o novo nó orbital de controle físico de pacotes.
        INSERT INTO TB_CHRONOS_NODE (ID_NODE, NM_NODE, DS_LOCATION, ST_NODE)
        VALUES (v_node_id, v_node_name, v_node_loc, v_node_status);
        
        -- Por que: Confirma a inserção do nó para o banco de dados.
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Nó "' || v_node_name || '" inserido com sucesso.');
    END IF;
    
EXCEPTION
    -- Por que: Captura qualquer exceção geral (ex: chave primária duplicada ou limite excedido).
    WHEN OTHERS THEN
        -- Por que: Desfaz qualquer transação inacabada em caso de falha de banco.
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Erro crítico ao processar cadastro de nó: ' || SQLERRM);
END;
/

-- =============================================================================
-- BLOCO ANÔNIMO 2: ROTEAMENTO DINÂMICO DE BUNDLES (STORE-AND-FORWARD)
-- LOGICA: WHILE LOOP, Cursor Explícito de Links Ativos, Estrutura Condicional IF-ELSIF.
-- =============================================================================
DECLARE
    -- Por que: Variável contendo o timestamp da hora operacional do roteador espacial.
    v_current_time TIMESTAMP := TO_TIMESTAMP('2026-05-28 15:00:00', 'YYYY-MM-DD HH24:MI:SS');
    -- Por que: ID do bundle selecionado para trânsito orbital.
    v_bundle_id TB_CHRONOS_BUNDLE.ID_BUNDLE%TYPE;
    -- Por que: Prioridade do bundle que dita a ordem de fila.
    v_priority TB_CHRONOS_BUNDLE.NR_PRIORITY%TYPE;
    
    -- Por que: Cursor explícito que busca canais de rádio ativos (UP) no momento atual.
    -- (Cursor Explícito 2)
    CURSOR cur_active_links IS
        SELECT ID_LINK, ID_NODE_SOURCE, ID_NODE_DEST
        FROM TB_CHRONOS_LINK
        WHERE ST_LINK = 'UP'
          AND v_current_time BETWEEN DT_START AND DT_END;
          
    -- Por que: Registro tipado para conter os dados de link ativo.
    v_link_rec cur_active_links%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== BLOCO 2: ROTEADOR DE REDE DTN ===');
    
    -- Por que: Abre o cursor de links disponíveis para a hora atual orbitária.
    OPEN cur_active_links;
    
    -- Por que: Loop para ler cada link que pode receber pacotes na janela orbital.
    -- (Estrutura de Repetição 1 - Loop Básico de Cursor)
    LOOP
        FETCH cur_active_links INTO v_link_rec;
        -- Por que: Condição de saída para encerrar quando varrer todos os canais de rádio ativos.
        EXIT WHEN cur_active_links%NOTFOUND;
        
        DBMS_OUTPUT.PUT_LINE('Link ativo detectado: ID ' || v_link_rec.ID_LINK || ' (Node ' || v_link_rec.ID_NODE_SOURCE || ' -> Node ' || v_link_rec.ID_NODE_DEST || ')');
        
        -- Por que: Estrutura WHILE que processa a fila de bundles pendentes para esta rota.
        -- (Estrutura de Repetição 2 - WHILE)
        WHILE v_current_time IS NOT NULL LOOP
            BEGIN
                -- Por que: Busca o bundle de maior prioridade pendente nesta rota de transmissão.
                SELECT ID_BUNDLE, NR_PRIORITY
                INTO v_bundle_id, v_priority
                FROM (
                    SELECT ID_BUNDLE, NR_PRIORITY
                    FROM TB_CHRONOS_BUNDLE
                    WHERE ID_NODE_SOURCE = v_link_rec.ID_NODE_SOURCE
                      AND ID_NODE_DEST = v_link_rec.ID_NODE_DEST
                      AND ST_TRANSMISSION = 'BUFFERED'
                    ORDER BY NR_PRIORITY DESC, DT_CREATED ASC
                )
                WHERE ROWNUM = 1;
                
                -- Por que: Estrutura condicional para validar prioridades e registrar log explicativo.
                -- (Estrutura Condicional 2)
                IF v_priority = 2 THEN
                    DBMS_OUTPUT.PUT_LINE(' -> Roteando Bundle Financeiro CRÍTICO (Prioridade Alta). ID: ' || v_bundle_id);
                ELSIF v_priority = 1 THEN
                    DBMS_OUTPUT.PUT_LINE(' -> Roteando Bundle de Dados Operacionais (Prioridade Média). ID: ' || v_bundle_id);
                ELSE
                    DBMS_OUTPUT.PUT_LINE(' -> Roteando Bundle de Baixa Prioridade (Telemetria). ID: ' || v_bundle_id);
                END IF;
                
                -- Por que: Atualiza o status do bundle na fila store-and-forward para indicar que subiu para o rádio.
                UPDATE TB_CHRONOS_BUNDLE
                SET ST_TRANSMISSION = 'IN_TRANSIT'
                WHERE ID_BUNDLE = v_bundle_id;
                
            EXCEPTION
                -- Por que: Trata erro quando não há mais bundles pendentes para este link específico (NO_DATA_FOUND).
                WHEN NO_DATA_FOUND THEN
                    DBMS_OUTPUT.PUT_LINE(' -> Sem mais bundles na fila para este link.');
                    -- Por que: Sai do loop WHILE forçando a variável de controle a nulo.
                    v_current_time := NULL;
            END;
        END LOOP;
        
        -- Por que: Reseta a variável de controle para a próxima iteração de link ativo do loop principal.
        v_current_time := TO_TIMESTAMP('2026-05-28 15:00:00', 'YYYY-MM-DD HH24:MI:SS');
        
    END LOOP;
    
    -- Por que: Fecha o cursor de links para liberar recursos de rede simulados.
    CLOSE cur_active_links;
    
    -- Por que: Consolida as atualizações de tráfego de rede no banco.
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Erro na rotina de roteamento dinâmico: ' || SQLERRM);
END;
/

-- =============================================================================
-- BLOCO ANÔNIMO 3: LIQUIDAÇÃO FINANCEIRA TRANSACIONAL COM VALIDAÇÃO DE SALDO
-- LOGICA: Cursor Explícito de Transações, FOR LOOP, IF-ELSE, SELECT INTO.
-- =============================================================================
DECLARE
    -- Por que: Variável auxiliar para carregar o saldo atual da conta debitada.
    v_balance_source TB_CHRONOS_ACCOUNT.VL_BALANCE%TYPE;
    -- Por que: Variável auxiliar contendo a moeda de origem.
    v_currency_source TB_CHRONOS_ACCOUNT.NM_CURRENCY%TYPE;
    -- Por que: Variável auxiliar contendo a moeda de destino para controle de câmbio.
    v_currency_dest TB_CHRONOS_ACCOUNT.NM_CURRENCY%TYPE;
    
    -- Por que: Cursor explícito para carregar transações financeiras na fila de liquidação.
    -- (Cursor Explícito 3)
    CURSOR cur_pending_txs IS
        SELECT ID_TRANSACTION, ID_ACCOUNT_SOURCE, ID_ACCOUNT_DEST, VL_AMOUNT
        FROM TB_CHRONOS_TRANSACTION
        WHERE ST_SETTLEMENT = 'PENDING';
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== BLOCO 3: PROCESSADOR DE LIQUIDAÇÃO FINANCEIRA ===');
    
    -- Por que: Usamos FOR LOOP implícito no cursor explícito para iteração segura e autogerenciável.
    -- (Estrutura de Repetição 3 - FOR LOOP de Cursor)
    FOR r_tx IN cur_pending_txs LOOP
        -- Por que: Executado sob bloco aninhado para que falha de uma transação não cancele as demais da fila.
        BEGIN
            -- Por que: Captura dados da conta remetente com bloqueio de linha (SELECT FOR UPDATE) para consistência concorrente.
            SELECT VL_BALANCE, NM_CURRENCY
            INTO v_balance_source, v_currency_source
            FROM TB_CHRONOS_ACCOUNT
            WHERE ID_ACCOUNT = r_tx.ID_ACCOUNT_SOURCE
            FOR UPDATE;
            
            -- Por que: Captura a moeda da conta destinatária para garantir conformidade cambial orbital.
            SELECT NM_CURRENCY
            INTO v_currency_dest
            FROM TB_CHRONOS_ACCOUNT
            WHERE ID_ACCOUNT = r_tx.ID_ACCOUNT_DEST;
            
            -- Por que: Estrutura condicional para validar se há fundos na conta considerando limite de crédito de $10.000.
            -- (Estrutura Condicional 3)
            IF (v_balance_source - r_tx.VL_AMOUNT) >= -10000.00 THEN
                
                -- Por que: Realiza o débito na conta de origem dos recursos.
                UPDATE TB_CHRONOS_ACCOUNT
                SET VL_BALANCE = VL_BALANCE - r_tx.VL_AMOUNT
                WHERE ID_ACCOUNT = r_tx.ID_ACCOUNT_SOURCE;
                
                -- Por que: Realiza o crédito correspondente na conta destinatária.
                UPDATE TB_CHRONOS_ACCOUNT
                SET VL_BALANCE = VL_BALANCE + r_tx.VL_AMOUNT
                WHERE ID_ACCOUNT = r_tx.ID_ACCOUNT_DEST;
                
                -- Por que: Atualiza o status da transação para liquidada com sucesso.
                UPDATE TB_CHRONOS_TRANSACTION
                SET ST_SETTLEMENT = 'SETTLED'
                WHERE ID_TRANSACTION = r_tx.ID_TRANSACTION;
                
                DBMS_OUTPUT.PUT_LINE(' -> Transação ' || r_tx.ID_TRANSACTION || ' liquidada: ' || r_tx.VL_AMOUNT || ' ' || v_currency_source);
            ELSE
                -- Por que: Rejeita a transação por falta de saldo/crédito no gateway financeiro.
                UPDATE TB_CHRONOS_TRANSACTION
                SET ST_SETTLEMENT = 'REJECTED'
                WHERE ID_TRANSACTION = r_tx.ID_TRANSACTION;
                
                DBMS_OUTPUT.PUT_LINE(' -> Transação ' || r_tx.ID_TRANSACTION || ' REJEITADA: Saldo insuficiente na conta ' || r_tx.ID_ACCOUNT_SOURCE);
            END IF;
            
        EXCEPTION
            -- Por que: Trata erros de falta de dados da conta.
            WHEN NO_DATA_FOUND THEN
                UPDATE TB_CHRONOS_TRANSACTION
                SET ST_SETTLEMENT = 'REJECTED'
                WHERE ID_TRANSACTION = r_tx.ID_TRANSACTION;
                DBMS_OUTPUT.PUT_LINE(' -> Transação ' || r_tx.ID_TRANSACTION || ' REJEITADA: Conta não localizada.');
        END;
    END LOOP;
    
    -- Por que: Grava definitivamente todas as transações resolvidas no banco.
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Erro no processador de liquidação: ' || SQLERRM);
END;
/

-- =============================================================================
-- BLOCO ANÔNIMO 4: RECONCILIAÇÃO E LOG DE SINCRONIZAÇÃO PÓS CONTATO
-- LOGICA: LOOP com EXIT WHEN (Tentativas de Conexão Rádio), INSERT, SELECT INTO.
-- =============================================================================
DECLARE
    -- Por que: ID do link orbital analisado.
    v_link_id TB_CHRONOS_LINK.ID_LINK%TYPE := 1;
    -- Por que: Contador de pacotes enviados com sucesso na janela.
    v_sent_count NUMBER := 0;
    -- Por que: Contador de falhas simuladas de rádio.
    v_errors_count NUMBER := 0;
    -- Por que: Contador de tentativas físicas de sincronismo.
    v_attempts NUMBER := 1;
    -- Por que: Status final do processo de auditoria.
    v_sync_status TB_CHRONOS_SYNC_LOG.ST_SYNC%TYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== BLOCO 4: RECONCILIAÇÃO E LOG DE ENLACE ===');
    
    -- Por que: Conta quantos bundles foram transmitidos com sucesso neste canal rádio específico.
    SELECT COUNT(*)
    INTO v_sent_count
    FROM TB_CHRONOS_BUNDLE
    WHERE ST_TRANSMISSION = 'IN_TRANSIT'
      AND ID_NODE_SOURCE = 1;
      
    -- Por que: Loop básico simulando as tentativas de handshake rádio com os satélites.
    -- (Estrutura de Repetição 4 - LOOP com EXIT WHEN)
    LOOP
        -- Por que: Incrementa as falhas em conexões distantes em 10% por tentativa de sinal.
        v_errors_count := v_errors_count + 1;
        DBMS_OUTPUT.PUT_LINE(' -> Tentando handshake de rádio espacial... Iteração: ' || v_attempts);
        
        -- Por que: Incrementa o contador de controle de tentativas rádio.
        v_attempts := v_attempts + 1;
        
        -- Por que: Condição para sair do loop após 3 tentativas físicas de sincronismo.
        EXIT WHEN v_attempts > 3;
    END LOOP;
    
    -- Por que: Decide o status do log dependendo do percentual de erros rádio detectado.
    IF v_errors_count = 0 THEN
        v_sync_status := 'SUCCESS';
    ELSIF v_sent_count > 0 THEN
        v_sync_status := 'PARTIAL';
    ELSE
        v_sync_status := 'FAILED';
    END IF;
    
    -- Por que: Insere o log de auditoria operacional do link espacial.
    INSERT INTO TB_CHRONOS_SYNC_LOG (ID_LOG, ID_LINK, DT_SYNC, QT_BUNDLES_SENT, QT_ERRORS, ST_SYNC)
    VALUES (5011, v_link_id, SYSTIMESTAMP, v_sent_count, v_errors_count, v_sync_status);
    
    -- Por que: Atualiza os bundles em trânsito no link 1 para entregues.
    UPDATE TB_CHRONOS_BUNDLE
    SET ST_TRANSMISSION = 'DELIVERED'
    WHERE ST_TRANSMISSION = 'IN_TRANSIT'
      AND ID_NODE_SOURCE = 1;
      
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Sincronização do Link ' || v_link_id || ' concluída com status: ' || v_sync_status);
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Erro na rotina de reconciliação de sinal: ' || SQLERRM);
END;
/

-- =============================================================================
-- BLOCO ANÔNIMO 5: EXPURGAMENTO E REJEIÇÃO DE BUNDLES EXPIRADOS
-- LOGICA: CASE condicional, FOR LOOP numérico de simulação, UPDATE/DELETE.
-- =============================================================================
DECLARE
    -- Por que: Cursor contendo os bundles que extrapolaram o TTL orbital espacial.
    -- (Cursor Explícito 4)
    CURSOR cur_expired_bundles IS
        SELECT ID_BUNDLE, ID_NODE_SOURCE, NR_PRIORITY
        FROM TB_CHRONOS_BUNDLE
        WHERE DT_EXPIRY < SYSTIMESTAMP
          AND ST_TRANSMISSION != 'DELIVERED';
          
    -- Por que: Contador de bundles que foram limpos para liberar espaço em disco nos nós.
    v_purged_count NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== BLOCO 5: EXPURGADOR DE ARMAZENAMENTO DTN ===');
    
    -- Por que: Varre a fila de pacotes expirados para limpeza física.
    FOR r_bundle IN cur_expired_bundles LOOP
        -- Por que: Incrementa o contador de registros afetados.
        v_purged_count := v_purged_count + 1;
        
        -- Por que: CASE condicional para classificar a gravidade da expiração do pacote.
        -- (Estrutura Condicional 4 - CASE)
        CASE r_bundle.NR_PRIORITY
            WHEN 2 THEN
                DBMS_OUTPUT.PUT_LINE(' -> ALERTA CRÍTICO: Bundle Financeiro Expirado no Nó ' || r_bundle.ID_NODE_SOURCE || '. ID: ' || r_bundle.ID_BUNDLE);
                -- Por que: Rejeita transações financeiras ligadas a este bundle de forma definitiva.
                UPDATE TB_CHRONOS_TRANSACTION
                SET ST_SETTLEMENT = 'REJECTED'
                WHERE ID_BUNDLE = r_bundle.ID_BUNDLE;
            WHEN 1 THEN
                DBMS_OUTPUT.PUT_LINE(' -> ALERTA MÉDIO: Bundle de Dados Expirado. ID: ' || r_bundle.ID_BUNDLE);
            ELSE
                DBMS_OUTPUT.PUT_LINE(' -> Info: Limpeza de telemetria comum expirada. ID: ' || r_bundle.ID_BUNDLE);
        END CASE;
        
        -- Por que: Atualiza o status de trânsito físico para EXPIRED no banco relacional.
        UPDATE TB_CHRONOS_BUNDLE
        SET ST_TRANSMISSION = 'EXPIRED'
        WHERE ID_BUNDLE = r_bundle.ID_BUNDLE;
    END LOOP;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Total de bundles expirados gerenciados: ' || v_purged_count);
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Erro na limpeza da fila de store-and-forward: ' || SQLERRM);
END;
/

-- =============================================================================
-- BLOCO ANÔNIMO 6: APLICAÇÃO DE TAXA CAMBIAL SOBRE CONTAS LUNARES
-- LOGICA: Cursores com parâmetros, IF condicional, atualização de valores.
-- =============================================================================
DECLARE
    -- Por que: Fator de cobrança cambial espacial (0.5%).
    v_tax_rate CONSTANT NUMBER(4,3) := 0.005;
    
    -- Por que: Cursor parametrizado para recuperar contas ativas em uma moeda específica.
    CURSOR cur_currency_accounts(p_currency VARCHAR2) IS
        SELECT ID_ACCOUNT, VL_BALANCE, NM_HOLDER
        FROM TB_CHRONOS_ACCOUNT
        WHERE NM_CURRENCY = p_currency
          AND VL_BALANCE > 0;
          
    -- Por que: Variável de registro para o cursor parametrizado.
    v_acct_rec cur_currency_accounts%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== BLOCO 6: COBRANÇA CAMBIAL LUNAR ===');
    
    -- Por que: Abre o cursor passando o token monetário lunar 'LUN'.
    OPEN cur_currency_accounts('LUN');
    
    LOOP
        FETCH cur_currency_accounts INTO v_acct_rec;
        EXIT WHEN cur_currency_accounts%NOTFOUND;
        
        -- Por que: IF condicional para aplicar tarifas sobre contas com saldos corporativos médios/altos (> 10.000 LUN).
        IF v_acct_rec.VL_BALANCE > 10000.00 THEN
            DBMS_OUTPUT.PUT_LINE(' -> Aplicando taxa de 0.5% na conta de ' || v_acct_rec.NM_HOLDER || '. Saldo: ' || v_acct_rec.VL_BALANCE);
            
            -- Por que: Atualiza o saldo cobrando a taxa operacional de rede DTN interestelar.
            UPDATE TB_CHRONOS_ACCOUNT
            SET VL_BALANCE = VL_BALANCE - (v_acct_rec.VL_BALANCE * v_tax_rate)
            WHERE ID_ACCOUNT = v_acct_rec.ID_ACCOUNT;
        END IF;
    END LOOP;
    
    CLOSE cur_currency_accounts;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Rotina de cobrança cambial finalizada com sucesso.');
    
EXCEPTION
    WHEN OTHERS THEN
        IF cur_currency_accounts%ISOPEN THEN
            CLOSE cur_currency_accounts;
        END IF;
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Erro na rotina cambial de contas lunares: ' || SQLERRM);
END;
/

exit;
