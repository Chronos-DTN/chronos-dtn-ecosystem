package br.com.fiap.chronosdtn.repository;

// Por que: Importa a entidade contendo dados financeiros de débito/crédito.
import br.com.fiap.chronosdtn.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Por que: Expõe operações de banco de dados para a reconciliação e criação de transações.
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Por que: Permite carregar transações por status para a rotina do processador de liquidação diferida.
    List<Transaction> findBySettlementStatus(String settlementStatus);
}
