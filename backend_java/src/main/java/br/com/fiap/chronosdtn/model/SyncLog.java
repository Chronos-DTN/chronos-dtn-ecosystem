package br.com.fiap.chronosdtn.model;

// Por que: Importa as anotações do Jakarta Persistence para persistência ORM de auditoria de rádio.
import jakarta.persistence.*;
// Por que: Importa as anotações do Lombok para reduzir código boilerplate de get/set.
import lombok.*;
// Por que: Permite registrar carimbos de data/hora exatos em que a rotina de auditoria encerrou.
import java.time.LocalDateTime;

// Por que: Define a classe como entidade JPA.
@Entity
// Por que: Associa à tabela de logs de auditoria e reconciliação.
@Table(name = "TB_CHRONOS_SYNC_LOG")
// Por que: Lombok - Getters para logs.
@Getter
// Por que: Lombok - Setters para logs.
@Setter
// Por que: Lombok - Construtor contendo todos os atributos.
@AllArgsConstructor
// Por que: Lombok - Construtor vazio.
@NoArgsConstructor
public class SyncLog {

    // Por que: Código identificador único do log de reconciliação de sinal.
    @Id
    @Column(name = "ID_LOG")
    private Long id;

    // Por que: Canal de rádio (link) utilizado para transmitir o lote de dados.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_LINK", nullable = false)
    private Link link;

    // Por que: Data/Hora de finalização do processo de auditoria de rádio.
    @Column(name = "DT_SYNC", nullable = false)
    private LocalDateTime syncTime;

    // Por que: Quantidade de pacotes que completaram a transmissão com sucesso.
    @Column(name = "QT_BUNDLES_SENT", nullable = false)
    private Integer bundlesSent;

    // Por que: Quantidade de erros físicos detectados durante o enlace (handshake errors).
    @Column(name = "QT_ERRORS", nullable = false)
    private Integer errorsCount;

    // Por que: Status final da sincronização (ex: SUCCESS, PARTIAL, FAILED).
    @Column(name = "ST_SYNC", nullable = false, length = 20)
    private String syncStatus;
}
