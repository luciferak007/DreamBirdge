package com.jobportal.repository;

import com.jobportal.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("select a from AuditLog a where " +
            "(:entity is null or a.entityType = :entity) and " +
            "(:actor is null or lower(a.actorEmail) like lower(concat('%', :actor, '%'))) " +
            "order by a.createdAt desc")
    Page<AuditLog> search(String entity, String actor, Pageable pageable);
}
