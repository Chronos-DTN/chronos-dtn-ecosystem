package br.com.fiap.chronosdtn.model;

// Por que: Importa as anotações do Jakarta Persistence para mapear chaves e relacionamentos de rede.
import jakarta.persistence.*;
// Por que: Importa Lombok para automatizar escrita de getters, setters e construtores de classe.
import lombok.*;
// Por que: Permite carregar carimbos de data/hora de precisão espacial (microsegundos) nas janelas de rádio.
import java.time.LocalDateTime;

// Por que: Declara que esta classe mapeia uma tabela do banco de dados relacional.
@Entity
// Por que: Associa esta classe à tabela física de enlaces espaciais.
@Table(name = "TB_CHRONOS_LINK")
// Por que: Lombok - Métodos getter gerados automaticamente.
@Getter
// Por que: Lombok - Métodos setter gerados automaticamente.
@Setter
// Por que: Lombok - Construtor padrão com todos os campos de link.
@AllArgsConstructor
// Por que: Lombok - Construtor vazio para o Hibernate.
@NoArgsConstructor
public class Link {

    // Por que: Define a chave primária de enlace de rede orbital.
    @Id
    @Column(name = "ID_LINK")
    private Long id;

    // Por que: Relacionamento de muitos-para-um ligando ao nó espacial de origem do sinal.
    @ManyToOne(fetch = FetchType.EAGER)
    // Por que: Mapeia a coluna da chave estrangeira referenciando o ID do nó transmissor.
    @JoinColumn(name = "ID_NODE_SOURCE", nullable = false)
    private Node sourceNode;

    // Por que: Relacionamento de muitos-para-um ligando ao nó receptor do sinal.
    @ManyToOne(fetch = FetchType.EAGER)
    // Por que: Mapeia a chave estrangeira referenciando o ID do nó destinatário.
    @JoinColumn(name = "ID_NODE_DEST", nullable = false)
    private Node destNode;

    // Por que: Início da disponibilidade da janela orbital de comunicação rádio.
    @Column(name = "DT_START", nullable = false)
    private LocalDateTime startTime;

    // Por que: Fim da disponibilidade da janela orbital de comunicação rádio.
    @Column(name = "DT_END", nullable = false)
    private LocalDateTime endTime;

    // Por que: Banda útil do enlace de rádio em Kilobits por segundo.
    @Column(name = "VL_BANDWIDTH_KBPS", nullable = false)
    private Double bandwidthKbps;

    // Por que: Latência de atraso do sinal baseada na velocidade da luz (segundos).
    @Column(name = "VL_LATENCY_SECONDS", nullable = false)
    private Double latencySeconds;

    // Por que: Estado atual de rádio da janela (ex: UP, DOWN, SCHEDULED).
    @Column(name = "ST_LINK", nullable = false, length = 20)
    private String status;
}
