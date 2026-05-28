package br.com.fiap.chronosdtn.model;

// Por que: Importa a anotação Embeddable do Jakarta Persistence para permitir embutir esta classe em outra entidade.
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
// Por que: Importa Lombok para automatizar getters, setters, construtores e verificação de igualdade estrutural.
import lombok.*;
// Por que: Chaves compostas do JPA exigem serialização para trânsito de dados em sessões e transações de banco.
import java.io.Serializable;

// Por que: Declara que esta classe pode ser embutida como campo ID em uma entidade JPA principal.
@Embeddable
// Por que: Lombok - Getters para chaves.
@Getter
// Por que: Lombok - Setters para chaves.
@Setter
// Por que: Lombok - Construtor contendo ID do Nó de Origem e Sequencial Local.
@AllArgsConstructor
// Por que: Lombok - Construtor vazio.
@NoArgsConstructor
// Por que: Cria equals e hashCode baseados em todos os campos, obrigatório para chaves compostas do Hibernate.
@EqualsAndHashCode
public class BundleId implements Serializable {

    // Por que: Define que a versão de serialização é fixa para compatibilidade.
    private static final long serialVersionUID = 1L;

    // Por que: Identificador do nó remetente (origem) do pacote DTN.
    @Column(name = "ID_NODE_SOURCE")
    private Long sourceNodeId;

    // Por que: Número de sequência incremental local no nó de origem, gerando ID único global combinadamente.
    @Column(name = "ID_BUNDLE")
    private Long localSequenceId;
}
