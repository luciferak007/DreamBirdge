package com.jobportal.config;

import com.jobportal.model.*;
import com.jobportal.repository.*;
import com.jobportal.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo data + the single Admin account on first boot.
 *
 * IMPORTANT: The admin account is created from {@link AdminProperties} (configured
 * in application.properties). It is the ONLY way to obtain an ADMIN user — registration
 * blocks the ADMIN role for everyone else (see AuthService).
 *
 * To change seed data, edit this file. To change admin credentials, edit application.properties.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final JobRepository jobs;
    private final PasswordEncoder enc;
    private final AdminProperties admin;
    private final AuditService audit;

    @Override
    public void run(String... args) {
        // 1) Always ensure admin exists (idempotent).
        if (users.findByEmail(admin.getEmail()).isEmpty()) {
            User a = users.save(User.builder()
                    .email(admin.getEmail())
                    .password(enc.encode(admin.getPassword()))
                    .fullName(admin.getFullName())
                    .role(Role.ADMIN)
                    .build());
            audit.logSystem("CREATE", "User", a.getId(), "system",
                    "Bootstrapped Admin account for " + a.getEmail());
        }

        // 2) Demo data only on a fresh install.
        if (users.count() > 1) return;

        User employer = users.save(User.builder()
                .email("employer@demo.com").password(enc.encode("password123"))
                .fullName("Acme Corp HR").role(Role.EMPLOYER).company("Acme Corp").build());
        users.save(User.builder()
                .email("seeker@demo.com").password(enc.encode("password123"))
                .fullName("Jane Seeker").role(Role.JOB_SEEKER).headline("Full-Stack Developer").build());

        jobs.save(Job.builder().title("Senior React Developer").company("Acme Corp").location("Remote")
                .type("FULL_TIME").category("Engineering").salaryMin(80000.0).salaryMax(120000.0)
                .description("Build modern UIs with React and TypeScript.")
                .requirements("3+ years React, Tailwind, REST APIs").employer(employer).active(true).build());
        jobs.save(Job.builder().title("Spring Boot Backend Engineer").company("Acme Corp").location("Berlin")
                .type("FULL_TIME").category("Engineering").salaryMin(70000.0).salaryMax(110000.0)
                .description("Design REST APIs with Spring Boot and JPA.")
                .requirements("Java 17, Spring Boot, MySQL").employer(employer).active(true).build());
        jobs.save(Job.builder().title("Product Designer").company("Acme Corp").location("Remote")
                .type("CONTRACT").category("Design").salaryMin(50000.0).salaryMax(90000.0)
                .description("Design user-centric experiences for our SaaS platform.")
                .requirements("Figma, design systems, UX research").employer(employer).active(true).build());

        audit.logSystem("CREATE", "Seed", null, "system", "Inserted demo employer, seeker, and 3 jobs");
    }
}
