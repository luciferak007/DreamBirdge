package com.jobportal.service;

import com.jobportal.model.AuditLog;
import com.jobportal.model.User;
import com.jobportal.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Centralised helper for writing AuditLog rows.
 * Every service that mutates data should call one of the log* methods here.
 */
@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository repo;

    public void log(String action, String entityType, Long entityId, User actor, String details) {
        repo.save(AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .actorEmail(actor != null ? actor.getEmail() : "system")
                .actorRole(actor != null && actor.getRole() != null ? actor.getRole().name() : "SYSTEM")
                .details(details)
                .build());
    }

    public void logSystem(String action, String entityType, Long entityId, String actorEmail, String details) {
        repo.save(AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .actorEmail(actorEmail == null ? "system" : actorEmail)
                .actorRole("SYSTEM")
                .details(details)
                .build());
    }
}
