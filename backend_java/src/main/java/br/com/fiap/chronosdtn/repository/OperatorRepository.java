package br.com.fiap.chronosdtn.repository;

// Por que: Importa a entidade Operator que este repositório gerencia.
import br.com.fiap.chronosdtn.model.Operator;
// Por que: Estende JpaRepository para herdar operações padrões de banco (CRUD).
import org.springframework.data.jpa.repository.JpaRepository;
// Por que: Importa a interface para encapsular retornos opcionais, evitando NullPointerException.
import java.util.Optional;

// Por que: Interface anotada como repositório pelo Spring Data JPA para geração dinâmica de queries.
public interface OperatorRepository extends JpaRepository<Operator, Long> {
    
    // Por que: Método de consulta derivado (Query Method) para buscar um operador pelo nome de usuário.
    Optional<Operator> findByUsername(String username);
}
