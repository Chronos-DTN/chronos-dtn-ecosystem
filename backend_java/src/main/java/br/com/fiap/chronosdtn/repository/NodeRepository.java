package br.com.fiap.chronosdtn.repository;

// Por que: Importa a entidade mapeada para a persistência.
import br.com.fiap.chronosdtn.model.Node;
// Por que: Importa a interface do Spring Data que expõe métodos padrão de CRUD e paginação.
import org.springframework.data.jpa.repository.JpaRepository;
// Por que: Declara que esta interface é um componente de acesso a dados (Repository).
import org.springframework.stereotype.Repository;

// Por que: Spring Data gera a implementação em tempo de execução para manipulação da tabela TB_CHRONOS_NODE.
@Repository
public interface NodeRepository extends JpaRepository<Node, Long> {
}
