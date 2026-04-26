package com.jobportal.dto;
import com.jobportal.model.Role;
import jakarta.validation.constraints.*;
import lombok.*;
public class AuthDtos {
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @Email @NotBlank private String email;
        @NotBlank @Size(min=6) private String password;
        @NotBlank private String fullName;
        @NotNull private Role role;
        private String company;
    }
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private Long id;
        private String email;
        private String fullName;
        private Role role;
    }
}
