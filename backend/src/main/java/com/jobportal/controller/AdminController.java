package com.jobportal.controller;

import com.jobportal.dto.JobDtos.JobResponse;
import com.jobportal.model.AuditLog;
import com.jobportal.model.Role;
import com.jobportal.model.User;
import com.jobportal.repository.*;
import com.jobportal.service.AuditService;
import com.jobportal.service.JobService;
import com.jobportal.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin-only API. Every endpoint requires ROLE_ADMIN (enforced by SecurityConfig
 * AND the @PreAuthorize annotation as defense in depth).
 *
 * Read operations:
 *   GET  /api/admin/stats              -> dashboard counters
 *   GET  /api/admin/users              -> all users
 *   GET  /api/admin/jobs               -> all jobs (active + inactive)
 *   GET  /api/admin/applications       -> all applications
 *   GET  /api/admin/audit              -> audit log (filterable, paginated)
 *
 * Write operations (every one is audited):
 *   PUT    /api/admin/users/{id}/role         -> change a user's role (cannot demote/promote ADMIN)
 *   DELETE /api/admin/users/{id}              -> delete user (cannot delete ADMIN)
 *   PUT    /api/admin/jobs/{id}/active        -> activate/deactivate job
 *   DELETE /api/admin/jobs/{id}               -> delete any job
 *   DELETE /api/admin/applications/{id}       -> delete application
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository users;
    private final JobRepository jobs;
    private final ApplicationRepository apps;
    private final AuditLogRepository audit;
    private final AuditService auditSvc;
    private final JobService jobService;

    // ---------- READ ----------

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> m = new HashMap<>();
        m.put("totalUsers", users.count());
        m.put("totalJobSeekers", users.findAll().stream().filter(u -> u.getRole() == Role.JOB_SEEKER).count());
        m.put("totalEmployers", users.findAll().stream().filter(u -> u.getRole() == Role.EMPLOYER).count());
        m.put("totalJobs", jobs.count());
        m.put("activeJobs", jobs.findAll().stream().filter(j -> j.isActive()).count());
        m.put("totalApplications", apps.count());
        m.put("totalAuditEntries", audit.count());
        return m;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> allUsers() {
        return users.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId()); m.put("email", u.getEmail());
            m.put("fullName", u.getFullName()); m.put("role", u.getRole());
            m.put("company", u.getCompany()); m.put("createdAt", u.getCreatedAt());
            return m;
        }).toList();
    }

    @GetMapping("/jobs")
    public List<JobResponse> allJobs() {
        return jobs.findAll().stream().map(jobService::toDto).toList();
    }

    @GetMapping("/applications")
    public List<Map<String, Object>> allApplications() {
        return apps.findAll().stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("jobId", a.getJob().getId()); m.put("jobTitle", a.getJob().getTitle());
            m.put("applicantEmail", a.getApplicant().getEmail());
            m.put("applicantName", a.getApplicant().getFullName());
            m.put("status", a.getStatus()); m.put("appliedAt", a.getAppliedAt());
            return m;
        }).toList();
    }

    /** READ the audit trail. Supports ?entity=Job&actor=foo&page=0&size=50. */
    @GetMapping("/audit")
    public Page<AuditLog> auditTrail(
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) String actor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return audit.search(entity, actor, PageRequest.of(page, Math.min(size, 200)));
    }

    // ---------- WRITE ----------

    @PutMapping("/users/{id}/role")
    public Map<String, Object> changeRole(@PathVariable Long id, @RequestBody Map<String, String> body,
                                          @AuthenticationPrincipal UserPrincipal admin) {
        User u = users.findById(id).orElseThrow();
        if (u.getRole() == Role.ADMIN)
            throw new IllegalStateException("Cannot change role of an ADMIN account");
        Role newRole = Role.valueOf(body.get("role"));
        if (newRole == Role.ADMIN)
            throw new IllegalStateException("Cannot promote any user to ADMIN");
        Role old = u.getRole();
        u.setRole(newRole);
        users.save(u);
        auditSvc.log("UPDATE", "User", u.getId(), admin.getUser(),
                "Role changed from " + old + " to " + newRole);
        return Map.of("id", u.getId(), "role", u.getRole());
    }

    @DeleteMapping("/users/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal admin) {
        User u = users.findById(id).orElseThrow();
        if (u.getRole() == Role.ADMIN)
            throw new IllegalStateException("Cannot delete the ADMIN account");
        users.delete(u);
        auditSvc.log("DELETE", "User", id, admin.getUser(), "Deleted user " + u.getEmail());
        return Map.of("deleted", id);
    }

    @PutMapping("/jobs/{id}/active")
    public JobResponse toggleJob(@PathVariable Long id, @RequestBody Map<String, Boolean> body,
                                 @AuthenticationPrincipal UserPrincipal admin) {
        var j = jobs.findById(id).orElseThrow();
        boolean before = j.isActive();
        j.setActive(Boolean.TRUE.equals(body.get("active")));
        jobs.save(j);
        auditSvc.log("STATUS_CHANGE", "Job", j.getId(), admin.getUser(),
                "Active changed from " + before + " to " + j.isActive());
        return jobService.toDto(j);
    }

    @DeleteMapping("/jobs/{id}")
    public Map<String, Object> deleteJob(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal admin) {
        var j = jobs.findById(id).orElseThrow();
        jobs.delete(j);
        auditSvc.log("DELETE", "Job", id, admin.getUser(), "Deleted job '" + j.getTitle() + "'");
        return Map.of("deleted", id);
    }

    @DeleteMapping("/applications/{id}")
    public Map<String, Object> deleteApplication(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal admin) {
        var a = apps.findById(id).orElseThrow();
        apps.delete(a);
        auditSvc.log("DELETE", "Application", id, admin.getUser(),
                "Deleted application of " + a.getApplicant().getEmail() + " for job " + a.getJob().getId());
        return Map.of("deleted", id);
    }
}
