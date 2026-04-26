package com.jobportal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Admin configuration.
 *
 * The admin account is **single-instance** and tied to ONE predefined email.
 * To change the admin email or default password, edit:
 *   backend/src/main/resources/application.properties
 *     app.admin.email=...
 *     app.admin.password=...
 *
 * No other email may register or be promoted to ADMIN — see AuthService.register().
 */
@Configuration
@ConfigurationProperties(prefix = "app.admin")
@Getter @Setter
public class AdminProperties {
    private String email = "admin@jobportal.com";
    private String password = "Admin@12345";
    private String fullName = "System Administrator";
}
