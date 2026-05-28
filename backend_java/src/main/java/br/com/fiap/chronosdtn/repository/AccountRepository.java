package br.com.fiap.chronosdtn.repository;

// Por que: Importa a entidade representando as contas correntes espaciais.
import br.com.fiap.chronosdtn.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Por que: Componente de acesso aos dados de contas bancárias da Terra e da Lua.
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
}
