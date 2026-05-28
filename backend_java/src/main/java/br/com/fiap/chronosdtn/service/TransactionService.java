package br.com.fiap.chronosdtn.service;

// Por que: Importa as entidades de modelo para manipulação de contas, transações e bundles.
import br.com.fiap.chronosdtn.model.*;
// Por que: Importa os DTOs para padronizar entrada e saída de dados da API.
import br.com.fiap.chronosdtn.dto.*;
// Por que: Importa os repositórios JPA para acesso e alteração no banco de dados.
import br.com.fiap.chronosdtn.repository.*;
// Por que: Importa exceções personalizadas para lidar com erros de negócio na API.
import br.com.fiap.chronosdtn.exception.*;
// Por que: Spring Service gerencia o ciclo de vida deste componente como Bean singleton.
import org.springframework.stereotype.Service;
// Por que: Transações de banco garantem rollback automático em caso de erros no processamento financeiro.
import org.springframework.transaction.annotation.Transactional;

// Por que: Fornece classes utilitárias para trabalhar com números decimais precisos (dinheiro).
import java.math.BigDecimal;
// Por que: Trabalhar com datas e tempos nos carimbos de transação e expiração do bundle.
import java.time.LocalDateTime;
// Por que: Suporta listas no retorno de coleções de transações.
import java.util.List;
// Por que: Permite converter coleções de entidades em DTOs usando streams de Java.
import java.util.stream.Collectors;

@Service
public class TransactionService {

    // Por que: Injeta o repositório de transações financeiras para persistência física.
    private final TransactionRepository transactionRepository;
    // Por que: Injeta o repositório de contas para verificação de saldo e aplicação de débitos/créditos.
    private final AccountRepository accountRepository;
    // Por que: Injeta o repositório de bundles DTN para armazenar pacotes na fila física Store-and-Forward.
    private final BundleRepository bundleRepository;

    // Por que: Injeção de dependência via construtor padrão, recomendada para facilidade de testes unitários.
    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              BundleRepository bundleRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.bundleRepository = bundleRepository;
    }

    // Por que: Retorna todas as transações cadastradas, convertendo-as para DTOs.
    public List<TransactionResponse> getAllTransactions() {
        // Por que: Busca todas as transações usando o repositório JPA.
        return transactionRepository.findAll().stream()
                // Por que: Mapeia cada entidade para o DTO de resposta imutável.
                .map(this::convertToResponse)
                // Por que: Coleta o resultado em uma lista.
                .collect(Collectors.toList());
    }

    // Por que: Retorna uma única transação específica filtrada por seu identificador principal.
    public TransactionResponse getTransactionById(Long id) {
        // Por que: Busca a transação ou dispara exceção caso o identificador não exista no banco.
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não localizada com ID: " + id));
        // Por que: Retorna a transação mapeada como DTO de resposta.
        return convertToResponse(transaction);
    }

    // Por que: Executa a criação de uma transação financeira sob contexto transacional rigoroso.
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        // Por que: Busca a conta de origem no banco de dados.
        Account sourceAccount = accountRepository.findById(request.sourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta de origem não cadastrada. ID: " + request.sourceAccountId()));

        // Por que: Busca a conta de destino no banco de dados.
        Account destAccount = accountRepository.findById(request.destAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta de destino não cadastrada. ID: " + request.destAccountId()));

        // Por que: Define o limite de crédito negativo que a conta pode atingir (ex: -10000.00).
        BigDecimal creditLimit = new BigDecimal("-10000.00");
        // Por que: Calcula qual seria o saldo da conta debitada pós transação.
        BigDecimal newSourceBalance = sourceAccount.getBalance().subtract(request.amount());

        // Por que: Valida se a conta de origem possui fundos e/ou limite disponível suficiente.
        if (newSourceBalance.compareTo(creditLimit) < 0) {
            // Por que: Lança exceção de negócios customizada mapeada para a RFC 7807 de erro HTTP.
            throw new InsufficientFundsException("Saldo insuficiente na conta de origem. Saldo atual: " + sourceAccount.getBalance() + ", limite: " + creditLimit);
        }

        // Por que: Executa o débito do valor da transferência na conta de origem do remetente.
        sourceAccount.setBalance(newSourceBalance);
        // Por que: Salva o novo saldo da conta de origem no banco relacional.
        accountRepository.save(sourceAccount);

        // Por que: Determina os IDs operacionais. Usamos contagem básica incremental em desenvolvimento.
        Long transactionId = transactionRepository.count() + 1;
        Long bundleId = bundleRepository.count() + 1;

        // Por que: Verifica se as contas residem no mesmo nó espacial (ex: ambas na Terra ou ambas na Lua).
        boolean isSameNode = sourceAccount.getNode().getId().equals(destAccount.getNode().getId());

        // Por que: Se residirem no mesmo nó, a liquidação é síncrona/imediata.
        if (isSameNode) {
            // Por que: Soma o valor correspondente na conta destinatária local.
            destAccount.setBalance(destAccount.getBalance().add(request.amount()));
            // Por que: Salva o novo saldo da conta de destino localmente.
            accountRepository.save(destAccount);
        }

        // Por que: Monta a string JSON que representa a carga útil (payload) do bundle de roteamento DTN.
        String payload = String.format("{\"transactionId\":%d,\"sourceAccountId\":%d,\"destAccountId\":%d,\"amount\":%s,\"priority\":%d}",
                transactionId, sourceAccount.getId(), destAccount.getId(), request.amount().toString(), request.priority());

        // Por que: Calcula o hash criptográfico SHA-256 da string de dados para auditoria física do pacote.
        String payloadHash = calculateSha256(payload);

        // Por que: Instancia um novo bundle de transporte para auditoria ou roteamento posterior.
        Bundle bundle = new Bundle();
        // Por que: Cria o identificador de chave composta do bundle contendo o nó de origem e sequencial local.
        BundleId compositeId = new BundleId(sourceAccount.getNode().getId(), bundleId);
        // Por que: Define a PK composta no objeto bundle.
        bundle.setId(compositeId);
        // Por que: Associa o nó físico de origem.
        bundle.setSourceNode(sourceAccount.getNode());
        // Por que: Associa o nó físico destinatário final.
        bundle.setDestNode(destAccount.getNode());
        // Por que: Define o payload gerado em formato JSON.
        bundle.setPayload(payload);
        // Por que: Grava o hash SHA-256 gerado.
        bundle.setHash(payloadHash);
        // Por que: Define a prioridade DTN conforme informado no request.
        bundle.setPriority(request.priority());
        // Por que: Se for no mesmo nó, marca como entregue (DELIVERED). Caso contrário, enfileira no buffer (BUFFERED).
        bundle.setTransmissionStatus(isSameNode ? "DELIVERED" : "BUFFERED");
        // Por que: Grava o instante de criação espacial.
        bundle.setCreatedTime(LocalDateTime.now());
        // Por que: TTL do bundle (2 dias se precisar de trânsito orbital, 1 dia se for local).
        bundle.setExpiryTime(LocalDateTime.now().plusDays(isSameNode ? 1 : 2));

        // Por que: Salva o bundle na base de dados para reconciliação ou envio pelo rádio.
        bundleRepository.save(bundle);

        // Por que: Instancia a transação financeira para persistência em auditoria.
        Transaction transaction = new Transaction();
        // Por que: Define a chave primária gerada manualmente.
        transaction.setId(transactionId);
        // Por que: Associa o ID numérico do bundle transportador para conformidade de integridade.
        transaction.setBundleId(bundleId);
        // Por que: Associa a conta de débito.
        transaction.setSourceAccount(sourceAccount);
        // Por que: Associa a conta de crédito.
        transaction.setDestAccount(destAccount);
        // Por que: Grava o valor monetário da transação.
        transaction.setAmount(request.amount());
        // Por que: Registra o timestamp local do evento financeiro.
        transaction.setTransactionTime(LocalDateTime.now());
        // Por que: Transações locais nascem liquidadas (SETTLED). Transações cruzadas nascem pendentes (PENDING).
        transaction.setSettlementStatus(isSameNode ? "SETTLED" : "PENDING");

        // Por que: Salva a nova transação financeira na base relacional do gateway.
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Por que: Retorna a transação criada convertida em DTO para o cliente HTTP.
        return convertToResponse(savedTransaction);
    }

    // Por que: Varre transações pendentes e aplica créditos em contas de nós remotos cujos bundles foram entregues.
    @Transactional
    public void reconcileDeliveredTransactions() {
        // Por que: Busca todas as transações que ainda se encontram pendentes de sincronismo orbital.
        List<Transaction> pendingTransactions = transactionRepository.findBySettlementStatus("PENDING");

        // Por que: Itera sobre cada transação financeira pendente.
        for (Transaction tx : pendingTransactions) {
            // Por que: Captura o ID do nó de origem a partir da conta de débito.
            Long sourceNodeId = tx.getSourceAccount().getNode().getId();
            // Por que: Reconstrói a chave composta do bundle associado.
            BundleId bundleId = new BundleId(sourceNodeId, tx.getBundleId());

            // Por que: Procura o bundle na base de dados local.
            bundleRepository.findById(bundleId).ifPresent(bundle -> {
                // Por que: Se o status de transmissão do rádio espacial for DELIVERED (entregue no destino):
                if ("DELIVERED".equals(bundle.getTransmissionStatus())) {
                    // Por que: Carrega a conta de destino correspondente.
                    Account destAccount = tx.getDestAccount();
                    // Por que: Executa o crédito do valor transferido na conta destinatária.
                    destAccount.setBalance(destAccount.getBalance().add(tx.getAmount()));
                    // Por que: Salva a conta destinatária com o saldo atualizado.
                    accountRepository.save(destAccount);

                    // Por que: Atualiza o status da transação para liquidada com sucesso.
                    tx.setSettlementStatus("SETTLED");
                    // Por que: Persiste a alteração do status da transação no banco.
                    transactionRepository.save(tx);
                }
            });
        }
    }

    // Por que: Método auxiliar para converter entidade JPA Transaction em DTO imutável TransactionResponse.
    private TransactionResponse convertToResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getBundleId(),
                transaction.getSourceAccount().getNode().getId(),
                transaction.getSourceAccount().getId(),
                transaction.getDestAccount().getId(),
                transaction.getAmount(),
                transaction.getSettlementStatus(),
                transaction.getTransactionTime()
        );
    }

    // Por que: Calcula a assinatura SHA-256 de dados para integridade de payloads em redes espaciais.
    private String calculateSha256(String text) {
        try {
            // Por que: Instancia o algoritmo padrão SHA-256 do Java Security.
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            // Por que: Converte o texto para array de bytes codificados em UTF-8 e calcula o hash.
            byte[] hash = digest.digest(text.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            // Por que: StringBuilder armazena a representação em texto hexadecimal.
            StringBuilder hexString = new StringBuilder();
            // Por que: Varre cada byte do hash calculado.
            for (byte b : hash) {
                // Por que: Converte o byte para string hexadecimal.
                String hex = Integer.toHexString(0xff & b);
                // Por que: Acrescenta zero à esquerda se for caractere único.
                if (hex.length() == 1) hexString.append('0');
                // Por que: Adiciona o caractere hexadecimal ao buffer.
                hexString.append(hex);
            }
            // Por que: Retorna a string hash final.
            return hexString.toString();
        } catch (Exception ex) {
            // Por que: Lança exceção de execução se houver falha de ambiente com o algoritmo.
            throw new RuntimeException("Falha ao computar hash SHA-256", ex);
        }
    }
}
