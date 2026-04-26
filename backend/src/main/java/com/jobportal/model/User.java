package com.jobportal.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true, nullable=false) private String email;
    @Column(nullable=false) private String password;
    @Column(nullable=false) private String fullName;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
    private String headline;
    @Column(length=2000) private String bio;
    private String company;
    private Instant createdAt;
    @PrePersist public void pre() { createdAt = Instant.now(); }
}
