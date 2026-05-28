package br.com.fiap.chronosdtn.model;

// Por que: Importa as anotações do Jakarta Persistence para mapear os dados da transação.
import jakarta.persistence.*;
// Por que: Importa Lombok para reduzir código boilerplate de get/set.
import lombok.*;
// Por que: BigDecimal garante precisão absoluta sem erros de arredondamento em finanças espaciais.
import java.math.BigDecimal;
// Por que: Permite registrar carimbos de data/hora exatos em que a transferência ocorreu.
import java.time.LocalDateTime;

// Por que: Declara que esta classe mapeia uma tabela do banco de dados relacional.
@Entity
// Por que: Associa esta classe à tabela física de transações financeiras.
@Table(name = "TB_CHRONOS_TRANSACTION")
// Por que: Lombok - Getters automáticos.
@Getter
// Por que: Lombok - Setters automáticos.
@Setter
// Por que: Lombok - Construtor contendo todos os atributos.
@AllArgsConstructor
// Por que: Lombok - Construtor vazio.
@NoArgsConstructor
public class Transaction {

    // Por que: Identificador único da transação financeira.
    @Id
    @Column(name = "ID_TRANSACTION")
    private Long id;

    // Por que: Identificador do bundle de rede que transporta a transação. Mantemos como campo numérico para manter o desacoplamento lógico e físico exigido em redes tolerantes a atrasos (DTN).
    @Column(name = "ID_BUNDLE", nullable = false)
    private Long bundleId;

    // Por que: Relacionamento com a conta de origem de onde os créditos serão debitados.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_ACCOUNT_SOURCE", nullable = false)
    private Account sourceAccount;

    // Por que: Relacionamento com a conta de destino onde os créditos serão depositados.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_ACCOUNT_DEST", nullable = false)
    private Account destAccount;

    // Por que: Valor monetário a ser transferido entre as contas.
    @Column(name = "VL_AMOUNT", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // Por que: Data/Hora exata de solicitação local da transação no gateway.
    @Column(name = "DT_TRANSACTION", nullable = false)
    private LocalDateTime transactionTime;

    // Por que: Estado de reconciliação bancária da transação (ex: PENDING, SETTLED, REJECTED).
    @Column(name = "ST_SETTLEMENT", nullable = false, length = 20)
    private String settlementStatus;
}
