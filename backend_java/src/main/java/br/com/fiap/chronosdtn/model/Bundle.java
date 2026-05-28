package br.com.fiap.chronosdtn.model;

// Por que: Importa as anotações do Jakarta Persistence para persistência ORM de chaves embutidas e CLOBs.
import jakarta.persistence.*;
// Por que: Importa as anotações do Lombok para reduzir código boilerplate de get/set.
import lombok.*;
// Por que: Permite carregar carimbos de data/hora de criação e expiração da fila espacial.
import java.time.LocalDateTime;

// Por que: Declara esta classe como uma entidade JPA gerenciada.
@Entity
// Por que: Associa à tabela de buffers do protocolo DTN (Store-and-Forward).
@Table(name = "TB_CHRONOS_BUNDLE")
// Por que: Lombok - Getters para dados do bundle.
@Getter
// Por que: Lombok - Setters para dados do bundle.
@Setter
// Por que: Lombok - Construtor contendo todos os atributos.
@AllArgsConstructor
// Por que: Lombok - Construtor vazio para o Hibernate.
@NoArgsConstructor
public class Bundle {

    // Por que: Declara o uso de chave composta embutida (@EmbeddedId) para identificação global resiliente.
    @EmbeddedId
    private BundleId id;

    // Por que: Relacionamento de muitos-para-um ligando ao nó remetente físico de origem do pacote.
    @ManyToOne(fetch = FetchType.EAGER)
    // Por que: Mapeia o nó de origem vinculando-se à coluna que já compõe a chave do bundle, exigindo read-only (insert/update false) para evitar conflitos de mapeamento.
    @JoinColumn(name = "ID_NODE_SOURCE", referencedColumnName = "ID_NODE", insertable = false, updatable = false)
    private Node sourceNode;

    // Por que: Relacionamento com o nó receptor final do pacote espacial.
    @ManyToOne(fetch = FetchType.EAGER)
    // Por que: Chave estrangeira que aponta para o ID do nó de destino.
    @JoinColumn(name = "ID_NODE_DEST", nullable = false)
    private Node destNode;

    // Por que: Carga útil serializada contendo os dados da transação bancária em formato JSON.
    @Lob
    @Column(name = "TX_PAYLOAD", nullable = false)
    private String payload;

    // Por que: Hash SHA-256 para checagem rápida de integridade binária do payload.
    @Column(name = "TX_HASH", nullable = false, length = 64)
    private String hash;

    // Por que: Nível de prioridade de entrega espacial (0 = Baixa, 1 = Média, 2 = Alta).
    @Column(name = "NR_PRIORITY", nullable = false)
    private Integer priority;

    // Por que: Estado de trânsito físico do pacote (ex: BUFFERED, IN_TRANSIT, DELIVERED, EXPIRED).
    @Column(name = "ST_TRANSMISSION", nullable = false, length = 20)
    private String transmissionStatus;

    // Por que: Data de empacotamento no gateway de origem.
    @Column(name = "DT_CREATED", nullable = false)
    private LocalDateTime createdTime;

    // Por que: Tempo de vida útil do pacote (TTL) após o qual o bundle expira.
    @Column(name = "DT_EXPIRY", nullable = false)
    private LocalDateTime expiryTime;
}
