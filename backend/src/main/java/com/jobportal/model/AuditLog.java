package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * AuditLog (PostgreSQL-safe)
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** CREATE | UPDATE | DELETE | STATUS_CHANGE | LOGIN | REGISTER */
    @Column(nullable = false, length = 32)
    private String action;

    /** Maps to entity_type */
    @Column(name = "entity_type", nullable = false, length = 64)
    private String entityType;

    /** Maps to entity_id */
    @Column(name = "entity_id")
    private Long entityId;

    /** Maps to actor_email */
    @Column(name = "actor_email", nullable = false, length = 255)
    private String actorEmail;

    /** Maps to actor_role */
    @Column(name = "actor_role", length = 32)
    private String actorRole;

    @Column(length = 2000)
    private String details;

    /** Maps to created_at */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
