package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_entity", columnList = "entity_type"),
        @Index(name = "idx_audit_actor", columnList = "actor_email"),
        @Index(name = "idx_audit_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // ✅ FIXED for PostgreSQL
    private Long id;

    /** CREATE | UPDATE | DELETE | STATUS_CHANGE | LOGIN | REGISTER */
    @Column(nullable = false, length = 32)
    private String action;

    /** Logical entity name e.g. Job, Application, User, Auth */
    @Column(name = "entity_type", nullable = false, length = 64) // ✅ FIXED
    private String entityType;

    /** PK of affected row */
    @Column(name = "entity_id")
    private Long entityId;

    /** Email of user who performed the action */
    @Column(name = "actor_email", nullable = false, length = 255) // ✅ FIXED
    private String actorEmail;

    /** Role of actor */
    @Column(name = "actor_role", length = 32) // ✅ FIXED
    private String actorRole;

    /** Details */
    @Column(length = 2000)
    private String details;

    /** Timestamp */
    @Column(name = "created_at", nullable = false) // ✅ FIXED
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
