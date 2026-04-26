package com.jobportal.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
public class JobDtos {
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class JobRequest {
        @NotBlank private String title;
        @NotBlank private String company;
        @NotBlank private String location;
        @NotBlank private String type;
        @NotBlank private String category;
        private Double salaryMin;
        private Double salaryMax;
        @NotBlank private String description;
        private String requirements;
    }
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class JobResponse {
        private Long id;
        private String title;
        private String company;
        private String location;
        private String type;
        private String category;
        private Double salaryMin;
        private Double salaryMax;
        private String description;
        private String requirements;
        private Long employerId;
        private String employerName;
        private Instant postedAt;
        private boolean active;
    }
}
