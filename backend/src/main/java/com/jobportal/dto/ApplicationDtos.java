package com.jobportal.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
public class ApplicationDtos {
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ApplyRequest {
        @NotNull private Long jobId;
        @NotBlank private String coverLetter;
        private String resumeUrl;
    }
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApplicationResponse {
        private Long id;
        private Long jobId;
        private String jobTitle;
        private String company;
        private Long applicantId;
        private String applicantName;
        private String applicantEmail;
        private String coverLetter;
        private String resumeUrl;
        private String status;
        private Instant appliedAt;
    }
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class StatusUpdate {
        @NotBlank private String status;
    }
}
