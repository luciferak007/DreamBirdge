package com.jobportal.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String company;
    @Column(nullable=false) private String location;
    @Column(nullable=false) private String type; // FULL_TIME, PART_TIME, REMOTE, CONTRACT
    @Column(nullable=false) private String category;
    private Double salaryMin;
    private Double salaryMax;
    @Column(length=4000, nullable=false) private String description;
    @Column(length=2000) private String requirements;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="employer_id", nullable=false) private User employer;
    private Instant postedAt;
    private boolean active = true;
    @PrePersist public void pre() { postedAt = Instant.now(); }
}
