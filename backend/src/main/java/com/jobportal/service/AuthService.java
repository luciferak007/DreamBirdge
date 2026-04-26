package com.jobportal.service;

import com.jobportal.config.AdminProperties;
import com.jobportal.dto.AuthDtos.*;
import com.jobportal.exception.ApiException;
import com.jobportal.model.Role;
import com.jobportal.model.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder enc;
    private final JwtService jwt;
    private final AuthenticationManager authManager;
    private final AdminProperties adminProps;
    private final AuditService audit;

    public AuthResponse register(RegisterRequest r) {
        if (users.existsByEmail(r.getEmail()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already registered");

        // SECURITY: Block ADMIN role from public registration.
        // The admin account is bootstrapped once by DataSeeder using AdminProperties
        // and tied to a single predefined email. No other user may become admin.
        if (r.getRole() == Role.ADMIN)
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts cannot be created via registration");

        if (r.getEmail().equalsIgnoreCase(adminProps.getEmail()))
            throw new ApiException(HttpStatus.FORBIDDEN, "This email is reserved for the system administrator");

        User u = users.save(User.builder()
                .email(r.getEmail()).password(enc.encode(r.getPassword()))
                .fullName(r.getFullName()).role(r.getRole()).company(r.getCompany()).build());
        audit.log("REGISTER", "User", u.getId(), u, "New " + u.getRole() + " account registered");

        String token = jwt.generate(u.getEmail(), Map.of("role", u.getRole().name(), "uid", u.getId()));
        return AuthResponse.builder().token(token).id(u.getId()).email(u.getEmail())
                .fullName(u.getFullName()).role(u.getRole()).build();
    }

    public AuthResponse login(LoginRequest r) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(r.getEmail(), r.getPassword()));
        User u = users.findByEmail(r.getEmail()).orElseThrow();
        audit.log("LOGIN", "Auth", u.getId(), u, "User logged in");
        String token = jwt.generate(u.getEmail(), Map.of("role", u.getRole().name(), "uid", u.getId()));
        return AuthResponse.builder().token(token).id(u.getId()).email(u.getEmail())
                .fullName(u.getFullName()).role(u.getRole()).build();
    }
}
