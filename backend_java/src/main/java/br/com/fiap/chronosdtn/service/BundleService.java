package br.com.fiap.chronosdtn.service;

// Por que: Importa as entidades de dados necessárias.
import br.com.fiap.chronosdtn.model.*;
import br.com.fiap.chronosdtn.repository.*;
import br.com.fiap.chronosdtn.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BundleService {

    // Por que: Injeta os repositórios necessários para a simulação de rádio e trânsito.
    private final BundleRepository bundleRepository;
    private final LinkRepository linkRepository;
    private final SyncLogRepository syncLogRepository;
    private final NodeRepository nodeRepository;

    // Por que: Construtor injetado.
    public BundleService(BundleRepository bundleRepository, 
                         LinkRepository linkRepository, 
                         SyncLogRepository syncLogRepository,
                         NodeRepository nodeRepository) {
        this.bundleRepository = bundleRepository;
        this.linkRepository = linkRepository;
        this.syncLogRepository = syncLogRepository;
        this.nodeRepository = nodeRepository;
    }

    // Por que: Retorna a lista de todos os bundles cadastrados na base de dados.
    public List<Bundle> getAllBundles() {
        return bundleRepository.findAll();
    }

    // Por que: Retorna um bundle específico com base em sua chave composta (sourceNodeId e localSequenceId).
    public Bundle getBundleById(Long sourceNodeId, Long localSequenceId) {
        BundleId bundleId = new BundleId(sourceNodeId, localSequenceId);
        return bundleRepository.findById(bundleId)
                .orElseThrow(() -> new ResourceNotFoundException("Bundle não localizado com ID " + sourceNodeId + "-" + localSequenceId));
    }

    // Por que: Persiste um novo bundle na fila Store-and-Forward do nó local.
    @Transactional
    public Bundle saveBundle(Bundle bundle) {
        return bundleRepository.save(bundle);
    }

    // Por que: Rotina de simulação de roteamento. Procura links de rádio ativos e despacha bundles pendentes.
    @Transactional
    public int transmitPendingBundles() {
        // Por que: Pega a hora espacial corrente.
        LocalDateTime currentTime = LocalDateTime.now();
        int transmittedCount = 0;

        // Por que: Busca no repositório todos os links que estão ativos (UP) no momento atual de contato.
        List<Link> activeLinks = linkRepository.findActiveLinksAtTime("UP", currentTime);

        // Por que: Varre cada enlace de rádio disponível.
        for (Link link : activeLinks) {
            // Por que: Busca bundles que aguardam envio no buffer físico do nó de origem daquele link ativo.
            List<Bundle> pendingBundles = bundleRepository.findPendingBundlesForRoute(
                    "BUFFERED", 
                    link.getSourceNode().getId(), 
                    link.getDestNode().getId()
            );

            // Por que: Se houver pacotes prontos na fila, inicia a transmissão rádio.
            if (!pendingBundles.isEmpty()) {
                int countForLink = 0;
                
                // Por que: Processa o lote de pacotes.
                for (Bundle bundle : pendingBundles) {
                    // Por que: Altera o status para entregue, simulando a recepção pelo nó destino.
                    bundle.setTransmissionStatus("DELIVERED");
                    bundleRepository.save(bundle);
                    countForLink++;
                    transmittedCount++;
                }

                // Por que: Gera o identificador numérico único incremental para o novo log.
                Long newLogId = syncLogRepository.count() + 1;

                // Por que: Registra um log de reconciliação de transmissão (SyncLog) auditando a janela.
                SyncLog syncLog = new SyncLog(
                        newLogId,
                        link,
                        currentTime,
                        countForLink,
                        0, // Por que: Simula zero perdas de sinal rádio na transmissão de teste.
                        "SUCCESS"
                );
                
                syncLogRepository.save(syncLog);
            }
        }

        // Por que: Retorna a quantidade de pacotes que conseguiram trafegar no espaço.
        return transmittedCount;
    }
}
