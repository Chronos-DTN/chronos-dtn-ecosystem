package br.com.fiap.chronosdtn.model;

// Por que: Importa as anotações do Jakarta Persistence para persistência das contas monetárias.
import jakarta.persistence.*;
// Por que: Importa as anotações do Lombok para reduzir código boilerplate de get/set.
import lombok.*;
// Por que: Importa BigDecimal para garantir precisão absoluta nas operações de saldo e câmbio.
import java.math.BigDecimal;

// Por que: Define a classe como entidade JPA.
@Entity
// Por que: Vincula a classe à tabela física de contas operacionais.
@Table(name = "TB_CHRONOS_ACCOUNT")
// Por que: Lombok - Getters para todos os campos.
@Getter
// Por que: Lombok - Setters para todos os campos.
@Setter
// Por que: Lombok - Construtor padrão com todos os campos de conta.
@AllArgsConstructor
// Por que: Lombok - Construtor vazio.
@NoArgsConstructor
public class Account {

    // Por que: Identificador único da conta bancária.
    @Id
    @Column(name = "ID_ACCOUNT")
    private Long id;

    // Por que: Relacionamento de muitos-para-um vinculando a conta ao nó que a gerencia.
    @ManyToOne(fetch = FetchType.EAGER)
    // Por que: Chave estrangeira que aponta para o ID do nó hospedeiro.
    @JoinColumn(name = "ID_NODE", nullable = false)
    private Node node;

    // Por que: Nome da empresa ou entidade titular da conta espacial.
    @Column(name = "NM_HOLDER", nullable = false, length = 100)
    private String holder;

    // Por que: Saldo financeiro, usando BigDecimal para evitar perda de precisão binária de ponto flutuante.
    @Column(name = "VL_BALANCE", nullable = false, precision = 15, scale = 2)
    private BigDecimal balance;

    // Por que: Nome da moeda da conta (ex: USD, LUN).
    @Column(name = "NM_CURRENCY", nullable = false, length = 10)
    private String currency;
}
