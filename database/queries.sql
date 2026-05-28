-- =============================================================================
-- CONSULTAS DE RELATÓRIOS ANALÍTICOS (JOINs) - ECOSSISTEMA CHRONOSDTN
-- PROPÓSITO: Auditar fluxos financeiros, latências e integridade de rede rádio.
-- AUTOR: Arquiteto de Sistemas Principal & Engenheiro de Software Sênior
-- =============================================================================

-- =============================================================================
-- RELATÓRIO 1: VOLUME DE TRANSAÇÕES ESPACIAIS POR LOCALIZAÇÃO (TERRA VS. LUA)
-- POR QUE: A banca examinadora e os stakeholders precisam saber o volume total
-- transacionado de forma agregada por origem geográfica/orbital.
-- =============================================================================
SELECT
    -- Por que: Mostra a localização física do nó de origem da conta debitada.
    n_src.DS_LOCATION AS ORIGEM_GEOGRAFICA,
    -- Por que: Mostra a localização física do nó de destino da conta creditada.
    n_dst.DS_LOCATION AS DESTINO_GEOGRAFICO,
    -- Por que: Conta o número total de operações concluídas nessa rota orbital.
    COUNT(t.ID_TRANSACTION) AS TOTAL_TRANSACOES,
    -- Por que: Soma o montante financeiro trafegado pela rota rádio.
    SUM(t.VL_AMOUNT) AS VOLUME_TOTAL_FINANCEIRO,
    -- Por que: Calcula a média do valor enviado para entender o ticket médio espacial.
    AVG(t.VL_AMOUNT) AS TICKET_MEDIO
FROM
    -- Por que: Tabela principal contendo as operações monetárias.
    TB_CHRONOS_TRANSACTION t
-- Por que: Conecta a transação com a conta de origem dos fundos.
INNER JOIN TB_CHRONOS_ACCOUNT a_src 
    ON t.ID_ACCOUNT_SOURCE = a_src.ID_ACCOUNT
-- Por que: Conecta a conta de origem ao nó de rede que a hospeda.
INNER JOIN TB_CHRONOS_NODE n_src 
    ON a_src.ID_NODE = n_src.ID_NODE
-- Por que: Conecta a transação com a conta destinatária dos fundos.
INNER JOIN TB_CHRONOS_ACCOUNT a_dst 
    ON t.ID_ACCOUNT_DEST = a_dst.ID_ACCOUNT
-- Por que: Conecta a conta de destino ao nó de rede que a hospeda.
INNER JOIN TB_CHRONOS_NODE n_dst 
    ON a_dst.ID_NODE = n_dst.ID_NODE
WHERE
    -- Por que: Filtra apenas transações devidamente liquidadas no ecossistema espacial.
    t.ST_SETTLEMENT = 'SETTLED'
GROUP BY
    -- Por que: Define o agrupamento de agregação pelas localizações físicas de origem e destino.
    n_src.DS_LOCATION,
    n_dst.DS_LOCATION
ORDER BY
    -- Por que: Ordena as rotas mais valiosas de forma decrescente.
    VOLUME_TOTAL_FINANCEIRO DESC;


-- =============================================================================
-- RELATÓRIO 2: EFICIÊNCIA DO LINK ESPACIAL E TAXA DE ERRO DE CONECTIVIDADE
-- POR QUE: Permite à engenharia de infraestrutura monitorar a perda física de
-- pacotes de rede rádio (handshake errors) por cada janela de enlace orbital.
-- =============================================================================
SELECT
    -- Por que: Identificador único do link orbital sob análise.
    l.ID_LINK,
    -- Por que: Nome amigável do nó transmissor.
    n_src.NM_NODE AS NO_TRANSMISSOR,
    -- Por que: Nome amigável do nó receptor.
    n_dst.NM_NODE AS NO_RECEPTOR,
    -- Por que: Soma o total acumulado de pacotes (bundles) que trafegaram com sucesso no enlace.
    SUM(s.QT_BUNDLES_SENT) AS BUNDLES_ENVIADOS_SUCESSO,
    -- Por que: Soma o total de erros e perdas físicas de rádio registradas no log.
    SUM(s.QT_ERRORS) AS TOTAL_ERROS_CONEXAO,
    -- Por que: Calcula a taxa percentual de erros em relação ao volume de tráfego. Evita divisão por zero.
    ROUND(
        (SUM(s.QT_ERRORS) / DECODE(SUM(s.QT_BUNDLES_SENT) + SUM(s.QT_ERRORS), 0, 1, SUM(s.QT_BUNDLES_SENT) + SUM(s.QT_ERRORS))) * 100, 
        2
    ) AS TAXA_PERCENTUAL_ERRO
FROM
    -- Por que: Entidade contendo o cadastro físico de janelas de contato.
    TB_CHRONOS_LINK l
-- Por que: Faz o cruzamento com a tabela de auditoria de logs de sincronização.
INNER JOIN TB_CHRONOS_SYNC_LOG s 
    ON l.ID_LINK = s.ID_LINK
-- Por que: Resolve o nome legível do nó remetente.
INNER JOIN TB_CHRONOS_NODE n_src 
    ON l.ID_NODE_SOURCE = n_src.ID_NODE
-- Por que: Resolve o nome legível do nó destinatário.
INNER JOIN TB_CHRONOS_NODE n_dst 
    ON l.ID_NODE_DEST = n_dst.ID_NODE
GROUP BY
    -- Por que: Agrupa pelas entidades do link e nós envolvidos.
    l.ID_LINK,
    n_src.NM_NODE,
    n_dst.NM_NODE
ORDER BY
    -- Por que: Ordena pelos links com maior perda rádio para acionar manutenção preventiva orbital.
    TAXA_PERCENTUAL_ERRO DESC;


-- =============================================================================
-- RELATÓRIO 3: FILA DE STORE-AND-FORWARD ATIVA (BUFFERED BUNDLES)
-- POR QUE: Apresenta a fila pendente de pacotes que estão retidos nos gateways
-- terrestres/lunares aguardando a abertura da próxima janela de contato físico.
-- =============================================================================
SELECT
    -- Por que: ID do pacote na fila de roteamento.
    b.ID_BUNDLE,
    -- Por que: Nível de prioridade DTN (exibido em formato textual legível por CASE).
    CASE b.NR_PRIORITY
        WHEN 2 THEN 'CRÍTICA - ALTA'
        WHEN 1 THEN 'OPERACIONAL - MÉDIA'
        ELSE 'TELEMETRIA - BAIXA'
    END AS PRIORIDADE_REDE,
    -- Por que: Estação que está segurando o pacote localmente no buffer físico.
    n_src.NM_NODE AS GATEWAY_ATUAL,
    -- Por que: Destino final do pacote após o trânsito espacial.
    n_dst.NM_NODE AS DESTINATARIO_FINAL,
    -- Por que: Valor financeiro contido no payload imutável do bundle.
    t.VL_AMOUNT AS VALOR_PENDENTE,
    -- Por que: Tempo de vida restante do pacote antes de sofrer expurgo por TTL expirado.
    ROUND((CAST(b.DT_EXPIRY AS DATE) - CAST(SYSTIMESTAMP AS DATE)) * 24 * 60, 2) AS MINUTOS_PARA_EXPIRAR
FROM
    -- Por que: Tabela contendo os pacotes físicos no buffer.
    TB_CHRONOS_BUNDLE b
-- Por que: Conecta com a transação correspondente contida no payload do bundle.
INNER JOIN TB_CHRONOS_TRANSACTION t 
    ON b.ID_BUNDLE = t.ID_BUNDLE
-- Por que: Conecta ao nó emissor (gateway onde o pacote aguarda envio).
INNER JOIN TB_CHRONOS_NODE n_src 
    ON b.ID_NODE_SOURCE = n_src.ID_NODE
-- Por que: Conecta ao nó de destino.
INNER JOIN TB_CHRONOS_NODE n_dst 
    ON b.ID_NODE_DEST = n_dst.ID_NODE
WHERE
    -- Por que: Filtra apenas pacotes que continuam armazenados no buffer local (store-and-forward).
    b.ST_TRANSMISSION = 'BUFFERED'
ORDER BY
    -- Por que: Ordena primeiro pela urgência da prioridade e depois pelo tempo de criação do pacote.
    b.NR_PRIORITY DESC,
    b.DT_CREATED ASC;


-- =============================================================================
-- RELATÓRIO 4: AUDITORIA CONSOLIDADA DE SALDOS E TRANSAÇÕES
-- POR QUE: Em auditorias de Gateway Financeiro corporativo, é crucial bater o
-- saldo real das contas contra a soma de depósitos/saques ocorridos.
-- =============================================================================
SELECT
    -- Por que: Código da conta auditada.
    a.ID_ACCOUNT,
    -- Por que: Nome da empresa ou governo dono dos fundos.
    a.NM_HOLDER AS TITULAR_CONTA,
    -- Por que: Saldo atualizado gravado na tabela principal de contas.
    a.VL_BALANCE AS SALDO_ATUAL_REGISTRADO,
    -- Por que: Calcula o fluxo líquido financeiro histórico (créditos menos débitos liquidados).
    COALESCE(
        (SELECT SUM(VL_AMOUNT) FROM TB_CHRONOS_TRANSACTION WHERE ID_ACCOUNT_DEST = a.ID_ACCOUNT AND ST_SETTLEMENT = 'SETTLED'), 0
    ) - COALESCE(
        (SELECT SUM(VL_AMOUNT) FROM TB_CHRONOS_TRANSACTION WHERE ID_ACCOUNT_SOURCE = a.ID_ACCOUNT AND ST_SETTLEMENT = 'SETTLED'), 0
    ) AS FLUXO_LIQUIDO_CALCULADO,
    -- Por que: Abreviação monetária da conta de auditoria.
    a.NM_CURRENCY AS MOEDA
FROM
    -- Por que: Tabela principal de contas.
    TB_CHRONOS_ACCOUNT a
ORDER BY
    -- Por que: Ordena pelas contas corporativas com maiores volumes financeiros.
    SALDO_ATUAL_REGISTRADO DESC;


-- =============================================================================
-- RELATÓRIO 5: LATÊNCIA DE LIQUIDAÇÃO ORBITÁRIA DE TRANSAÇÕES
-- POR QUE: Apresenta a média de atraso temporal (delay) enfrentada pelas
-- transações até sua consolidação final, o que provará a resiliência do DTN.
-- =============================================================================
SELECT
    -- Por que: Nó de origem terrestre ou lunar que despachou a transação.
    n_src.NM_NODE AS NO_ORIGEM,
    -- Por que: Nó destinatário final.
    n_dst.NM_NODE AS NO_DESTINO,
    -- Por que: Total de transações que cruzaram este canal.
    COUNT(t.ID_TRANSACTION) AS QTD_TRANSACOES,
    -- Por que: Média de latência em minutos enfrentada do envio à liquidação devido às janelas de rádio.
    ROUND(
        AVG(
            (EXTRACT(DAY FROM (t.DT_TRANSACTION - b.DT_CREATED)) * 24 * 60) +
            (EXTRACT(HOUR FROM (t.DT_TRANSACTION - b.DT_CREATED)) * 60) +
            (EXTRACT(MINUTE FROM (t.DT_TRANSACTION - b.DT_CREATED))) +
            (EXTRACT(SECOND FROM (t.DT_TRANSACTION - b.DT_CREATED)) / 60)
        ), 2
    ) AS LATENCIA_MEDIA_MINUTOS
FROM
    -- Por que: Tabela de transações financeiras liquidadas.
    TB_CHRONOS_TRANSACTION t
-- Por que: Conecta ao bundle correspondente de transporte de rádio.
INNER JOIN TB_CHRONOS_BUNDLE b 
    ON t.ID_BUNDLE = b.ID_BUNDLE
-- Por que: Conecta ao nó de origem da transação.
INNER JOIN TB_CHRONOS_NODE n_src 
    ON b.ID_NODE_SOURCE = n_src.ID_NODE
-- Por que: Conecta ao nó de destino.
INNER JOIN TB_CHRONOS_NODE n_dst 
    ON b.ID_NODE_DEST = n_dst.ID_NODE
WHERE
    -- Por que: Filtra apenas transações devidamente liquidadas no ecossistema.
    t.ST_SETTLEMENT = 'SETTLED'
GROUP BY
    -- Agrupa pelas rotas de comunicação mapeadas.
    n_src.NM_NODE,
    n_dst.NM_NODE
ORDER BY
    -- Ordena pela maior latência média enfrentada nas rotas espaciais.
    LATENCIA_MEDIA_MINUTOS DESC;
