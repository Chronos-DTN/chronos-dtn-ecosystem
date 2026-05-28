package br.com.fiap.chronosdtn.repository;

// Por que: Importa a entidade representativa dos logs de reconciliação.
import br.com.fiap.chronosdtn.model.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Por que: Permite salvar e auditar relatórios de transmissões bem-sucedidas ou corrompidas.
@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {
}
