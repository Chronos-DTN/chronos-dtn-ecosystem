package br.com.fiap.chronosdtn.controller;

// Por que: Importa os DTOs de requisição e resposta para transações.
import br.com.fiap.chronosdtn.dto.TransactionRequest;
import br.com.fiap.chronosdtn.dto.TransactionResponse;
// Por que: Importa o serviço que processa a lógica de negócio das transações.
import br.com.fiap.chronosdtn.service.TransactionService;
// Por que: Importa o Jakarta Validation para validar anotações como @NotNull e @Positive.
import jakarta.validation.Valid;
// Por que: Importa classes HATEOAS para envelopar os dados em hypermedia.
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
// Por que: Permite construir links dinâmicos apontando para métodos de controllers mapeados.
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;
// Por que: Classes utilitárias de HTTP do Spring.
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Por que: Classes auxiliares de coleções.
import java.util.List;
import java.util.stream.Collectors;

// Por que: RestController sinaliza que a classe responde chamadas REST em formato JSON.
@RestController
// Por que: Mapeia a URL padrão para recursos de transações.
@RequestMapping("/api/transactions")
// Por que: Habilita CORS para conexões entre a API e aplicativos móveis.
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TransactionController {

    // Por que: Serviço contendo as regras de liquidação de saldos e enfileiramento.
    private final TransactionService transactionService;

    // Por que: Injeção de dependência via construtor.
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Por que: Retorna a listagem completa de transações financeiras cadastradas com suporte HATEOAS.
    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<TransactionResponse>>> getAllTransactions() {
        // Por que: Busca a lista de transações formatadas como DTO do serviço.
        List<EntityModel<TransactionResponse>> transactions = transactionService.getAllTransactions().stream()
                // Por que: Envolve cada DTO em um modelo EntityModel para anexar hypermedia.
                .map(response -> EntityModel.of(response,
                        // Por que: Cria o link HATEOAS de self-service da própria transação.
                        linkTo(methodOn(TransactionController.class).getTransactionById(response.transactionId())).withSelfRel(),
                        // Por que: Cria o link HATEOAS apontando para o bundle físico que transporta esta transação no espaço.
                        linkTo(methodOn(BundleController.class).getBundleById(response.sourceNodeId(), response.bundleId())).withRel("transport-bundle")
                ))
                // Por que: Coleta em lista.
                .collect(Collectors.toList());

        // Por que: Cria a coleção HATEOAS agregando a lista de transações e o link da própria busca.
        CollectionModel<EntityModel<TransactionResponse>> collectionModel = CollectionModel.of(transactions,
                linkTo(methodOn(TransactionController.class).getAllTransactions()).withSelfRel()
        );

        // Por que: Retorna status HTTP 200 OK com as entidades e links.
        return ResponseEntity.ok(collectionModel);
    }

    // Por que: Retorna o detalhamento individual de uma transação específica identificada por ID.
    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<TransactionResponse>> getTransactionById(@PathVariable Long id) {
        // Por que: Busca os dados da transação.
        TransactionResponse response = transactionService.getTransactionById(id);

        // Por que: Cria o modelo HATEOAS com links para si mesmo e para o bundle de rede correspondente.
        EntityModel<TransactionResponse> entityModel = EntityModel.of(response,
                linkTo(methodOn(TransactionController.class).getTransactionById(id)).withSelfRel(),
                linkTo(methodOn(BundleController.class).getBundleById(response.sourceNodeId(), response.bundleId())).withRel("transport-bundle"),
                linkTo(methodOn(TransactionController.class).getAllTransactions()).withRel("all-transactions")
        );

        // Por que: Retorna HTTP 200 OK.
        return ResponseEntity.ok(entityModel);
    }

    // Por que: Mapeia requisições POST para iniciar a liquidação de créditos Terra-Lua.
    @PostMapping
    public ResponseEntity<EntityModel<TransactionResponse>> createTransaction(@Valid @RequestBody TransactionRequest request) {
        // Por que: Executa a criação física da transação no serviço, incluindo débitos/fila.
        TransactionResponse response = transactionService.createTransaction(request);

        // Por que: Envolve o retorno no EntityModel com os links dinâmicos para auditoria em tempo real.
        EntityModel<TransactionResponse> entityModel = EntityModel.of(response,
                linkTo(methodOn(TransactionController.class).getTransactionById(response.transactionId())).withSelfRel(),
                linkTo(methodOn(BundleController.class).getBundleById(response.sourceNodeId(), response.bundleId())).withRel("transport-bundle")
        );

        // Por que: Retorna HTTP 201 Created indicando que o recurso foi gravado no banco de dados.
        return ResponseEntity.status(HttpStatus.CREATED).body(entityModel);
    }
}
