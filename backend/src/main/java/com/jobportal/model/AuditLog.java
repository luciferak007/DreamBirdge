package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * AuditLog
 * --------
 * Tracks every modification (CREATE / UPDATE / DELETE / STATUS_CHANGE / LOGIN / REGISTER)
 * performed in the system. Records are READ-ONLY from the API surface — they can be queried
 * (GET /api/admin/audit) but never modified or deleted by clients.
 *
 * To change the timestamp format or timezone shown in the UI, edit:
 *   - frontend/src/pages/AdminDashboard.jsx  (formatDate helper)
 * To change the retention/seed behavior, edit this file's @PrePersist hook.
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_entity", columnList = "entityType"),
        @Index(name = "idx_audit_actor", columnList = "actorEmail"),
        @Index(name = "idx_audit_created", columnList = "createdAt")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** CREATE | UPDATE | DELETE | STATUS_CHANGE | LOGIN | REGISTER */
    @Column(nullable = false, length = 32)
    private String action;

    /** Logical entity name e.g. Job, Application, User, Auth */
    @Column(nullable = false, length = 64)
    private String entityType;

    /** PK of affected row (nullable for LOGIN/REGISTER without target). */
    private Long entityId;

    /** Email of user who performed the action (or "system"). */
    @Column(nullable = false, length = 255)
    private String actorEmail;

    /** Role of actor at time of action. */
    @Column(length = 32)
    private String actorRole;

    /** Free-form human-readable detail. */
    @Column(length = 2000)
    private String details;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void pre() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
