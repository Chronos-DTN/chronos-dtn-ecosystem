package br.com.fiap.chronosdtn.model;

// Por que: Importa as anotações do Jakarta Persistence para mapeamento objeto-relacional.
import jakarta.persistence.*;
// Por que: Importa as anotações do Lombok para evitar boilerplate de código.
import lombok.*;

// Por que: Declara que esta classe é uma entidade JPA gerenciada pelo hibernate.
@Entity
// Por que: Associa esta entidade com a tabela correspondente no banco de dados.
@Table(name = "TB_CHRONOS_OPERATOR")
// Por que: Lombok - Gera automaticamente os métodos getter para todos os atributos.
@Getter
// Por que: Lombok - Gera automaticamente os métodos setter para todos os atributos.
@Setter
// Por que: Lombok - Cria um construtor vazio exigido pelo JPA em tempo de execução.
@NoArgsConstructor
// Por que: Lombok - Cria um construtor com todos os argumentos.
@AllArgsConstructor
public class Operator {

    // Por que: Identifica a propriedade 'id' como chave primária.
    @Id
    // Por que: Configura a geração automática de chaves pelo banco de dados (Identity/Auto-Increment).
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Por que: Nomeia a coluna física no banco de dados.
    @Column(name = "ID_OPERATOR")
    private Long id;

    // Por que: Nome de login do operador, com validação de unicidade e tamanho.
    @Column(name = "NM_USERNAME", nullable = false, length = 50, unique = true)
    private String username;

    // Por que: Senha criptografada por hash BCrypt.
    @Column(name = "TX_PASSWORD", nullable = false, length = 100)
    private String password;

    // Por que: Nome completo do operador da estação.
    @Column(name = "NM_FULLNAME", nullable = false, length = 100)
    private String fullName;

    // Por que: Relação ManyToOne para identificar em qual nó espacial (estação) este operador trabalha.
    @ManyToOne
    // Por que: Nomeia a coluna da chave estrangeira.
    @JoinColumn(name = "ID_NODE")
    private Node node;
}
