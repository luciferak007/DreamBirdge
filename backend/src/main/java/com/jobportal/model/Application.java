package com.jobportal.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="applications", uniqueConstraints=@UniqueConstraint(columnNames={"job_id","applicant_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="job_id", nullable=false) private Job job;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="applicant_id", nullable=false) private User applicant;
    @Column(length=3000) private String coverLetter;
    private String resumeUrl;
    @Column(nullable=false) private String status = "PENDING"; // PENDING, REVIEWED, ACCEPTED, REJECTED
    private Instant appliedAt;
    @PrePersist public void pre() { appliedAt = Instant.now(); }
}
