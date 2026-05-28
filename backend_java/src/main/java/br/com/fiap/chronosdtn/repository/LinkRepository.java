package br.com.fiap.chronosdtn.repository;

// Por que: Importa a entidade que mapeia os contatos de rádio.
import br.com.fiap.chronosdtn.model.Link;
// Por que: Importa a interface do JPA Repository.
import org.springframework.data.jpa.repository.JpaRepository;
// Por que: Permite criar consultas JPQL customizadas caso queries derivadas fiquem complexas.
import org.springframework.data.jpa.repository.Query;
// Por que: Permite passar parâmetros nomeados para consultas SQL/JPQL.
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

// Por que: Provê a interface de persistência das janelas de enlace espacial.
@Repository
public interface LinkRepository extends JpaRepository<Link, Long> {

    // Por que: Localiza canais de comunicação disponíveis (UP) que cobrem um determinado momento no tempo.
    @Query("SELECT l FROM Link l WHERE l.status = :status AND :time BETWEEN l.startTime AND l.endTime")
    List<Link> findActiveLinksAtTime(
        @Param("status") String status, 
        @Param("time") LocalDateTime time
    );
}
