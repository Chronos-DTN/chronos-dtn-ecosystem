package br.com.fiap.chronosdtn.repository;

// Por que: Importa a entidade principal do bundle e sua chave composta correspondente.
import br.com.fiap.chronosdtn.model.Bundle;
import br.com.fiap.chronosdtn.model.BundleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// Por que: Permite o acesso a dados de bundles persistidos usando a chave composta BundleId.
@Repository
public interface BundleRepository extends JpaRepository<Bundle, BundleId> {

    // Por que: Localiza bundles no buffer do Store-and-Forward prontos para subirem ao rádio orbital.
    @Query("SELECT b FROM Bundle b WHERE b.transmissionStatus = :status " +
           "AND b.id.sourceNodeId = :sourceNodeId AND b.destNode.id = :destNodeId " +
           "ORDER BY b.priority DESC, b.createdTime ASC")
    List<Bundle> findPendingBundlesForRoute(
        @Param("status") String status,
        @Param("sourceNodeId") Long sourceNodeId,
        @Param("destNodeId") Long destNodeId
    );
}
