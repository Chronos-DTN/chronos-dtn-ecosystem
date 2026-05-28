package br.com.fiap.chronosdtn.controller;

// Por que: Importa o DTO de resposta de bundle.
import br.com.fiap.chronosdtn.dto.BundleResponse;
// Por que: Importa a entidade Bundle para manipulação.
import br.com.fiap.chronosdtn.model.Bundle;
// Por que: Importa os serviços de bundles e transações para orquestração de rede.
import br.com.fiap.chronosdtn.service.BundleService;
import br.com.fiap.chronosdtn.service.TransactionService;
// Por que: Importa classes HATEOAS para suporte a hypermedia.
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
// Por que: Importa classes auxiliares de rotas para linkagem dinâmica do HATEOAS.
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Por que: Utilidades de coleções e streams.
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Por que: RestController sinaliza que a classe expõe endpoints JSON.
@RestController
// Por que: Define a rota raiz do controlador.
@RequestMapping("/api/bundles")
// Por que: Libera CORS para integrações de frontend móvel.
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BundleController {

    // Por que: Injeta o serviço de controle da fila de bundles.
    private final BundleService bundleService;
    // Por que: Injeta o serviço de reconciliação de transações financeiras.
    private final TransactionService transactionService;

    // Por que: Construtor injetado.
    public BundleController(BundleService bundleService, TransactionService transactionService) {
        this.bundleService = bundleService;
        this.transactionService = transactionService;
    }

    // Por que: Retorna a fila Store-and-Forward de pacotes espaciais com suporte HATEOAS.
    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<BundleResponse>>> getAllBundles() {
        // Por que: Busca a lista de bundles no banco.
        List<EntityModel<BundleResponse>> bundles = bundleService.getAllBundles().stream()
                // Por que: Converte cada entidade para DTO.
                .map(this::convertToResponse)
                // Por que: Envolve o DTO no modelo EntityModel para suportar hypermedia.
                .map(response -> EntityModel.of(response,
                        // Por que: Adiciona link para obter os detalhes individuais daquele bundle.
                        linkTo(methodOn(BundleController.class).getBundleById(response.sourceNodeId(), response.localSequenceId())).withSelfRel()
                ))
                // Por que: Coleta em lista.
                .collect(Collectors.toList());

        // Por que: Envolve a lista em uma coleção HATEOAS enriquecida com o link self.
        CollectionModel<EntityModel<BundleResponse>> collectionModel = CollectionModel.of(bundles,
                linkTo(methodOn(BundleController.class).getAllBundles()).withSelfRel()
        );

        // Por que: Retorna HTTP 200 OK com o JSON HATEOAS.
        return ResponseEntity.ok(collectionModel);
    }

    // Por que: Busca um bundle específico com base em sua PK composta (Nó de Origem + Sequencial Local).
    @GetMapping("/{sourceNodeId}/{localSequenceId}")
    public ResponseEntity<EntityModel<BundleResponse>> getBundleById(
            @PathVariable Long sourceNodeId,
            @PathVariable Long localSequenceId) {
        
        // Por que: Busca os dados físicos do bundle.
        Bundle bundle = bundleService.getBundleById(sourceNodeId, localSequenceId);
        // Por que: Transforma em DTO padrão.
        BundleResponse response = convertToResponse(bundle);
        
        // Por que: Cria o modelo HATEOAS adicionando links de self-service.
        EntityModel<BundleResponse> entityModel = EntityModel.of(response,
                linkTo(methodOn(BundleController.class).getBundleById(sourceNodeId, localSequenceId)).withSelfRel(),
                linkTo(methodOn(BundleController.class).getAllBundles()).withRel("all-bundles")
        );

        // Por que: Retorna HTTP 200 OK.
        return ResponseEntity.ok(entityModel);
    }

    // Por que: Dispara a simulação de rádio orbital, transmitindo pacotes buffered e liquidando transações na chegada.
    @PostMapping("/transmit")
    public ResponseEntity<Map<String, Object>> transmitBundles() {
        // Por que: Executa a transmissão física e retorna o total de bundles enviados no rádio.
        int bundlesTransmitted = bundleService.transmitPendingBundles();
        
        // Por que: Executa a conciliação bancária das contas cujos bundles de trânsito foram entregues no destino.
        transactionService.reconcileDeliveredTransactions();
        
        // Por que: Retorna payload informativo da auditoria de rede.
        return ResponseEntity.ok(Map.of(
                "message", "Simulação de transmissão orbital e reconciliação financeira disparada com sucesso.",
                "bundlesTransmitted", bundlesTransmitted,
                "timestamp", java.time.LocalDateTime.now()
        ));
    }

    // Por que: Método utilitário privado para conversão de classe de domínio em DTO.
    private BundleResponse convertToResponse(Bundle bundle) {
        return new BundleResponse(
                bundle.getId().getSourceNodeId(),
                bundle.getId().getLocalSequenceId(),
                bundle.getDestNode().getId(),
                bundle.getPayload(),
                bundle.getHash(),
                bundle.getPriority(),
                bundle.getTransmissionStatus(),
                bundle.getCreatedTime(),
                bundle.getExpiryTime()
        );
    }
}
