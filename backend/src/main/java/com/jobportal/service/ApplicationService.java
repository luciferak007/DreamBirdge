package com.jobportal.service;

import com.jobportal.dto.ApplicationDtos.*;
import com.jobportal.exception.ApiException;
import com.jobportal.model.*;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository repo;
    private final JobRepository jobs;
    private final AuditService audit;

    public ApplicationResponse toDto(Application a) {
        return ApplicationResponse.builder().id(a.getId()).jobId(a.getJob().getId())
                .jobTitle(a.getJob().getTitle()).company(a.getJob().getCompany())
                .applicantId(a.getApplicant().getId()).applicantName(a.getApplicant().getFullName())
                .applicantEmail(a.getApplicant().getEmail()).coverLetter(a.getCoverLetter())
                .resumeUrl(a.getResumeUrl()).status(a.getStatus()).appliedAt(a.getAppliedAt()).build();
    }
    public ApplicationResponse apply(ApplyRequest r, User applicant) {
        if (applicant.getRole() != Role.JOB_SEEKER) throw new ApiException(HttpStatus.FORBIDDEN,"Only job seekers can apply");
        Job job = jobs.findById(r.getJobId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,"Job not found"));
        if (repo.existsByJobAndApplicant(job, applicant)) throw new ApiException(HttpStatus.BAD_REQUEST,"Already applied");
        Application a = Application.builder().job(job).applicant(applicant)
                .coverLetter(r.getCoverLetter()).resumeUrl(r.getResumeUrl()).status("PENDING").build();
        Application saved = repo.save(a);
        audit.log("CREATE", "Application", saved.getId(), applicant,
                "Applied to job " + job.getId() + " (" + job.getTitle() + ")");
        return toDto(saved);
    }
    public List<ApplicationResponse> mine(User applicant) {
        return repo.findByApplicantOrderByAppliedAtDesc(applicant).stream().map(this::toDto).toList();
    }
    public List<ApplicationResponse> forJob(Long jobId, User employer) {
        Job job = jobs.findById(jobId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,"Job not found"));
        if (!job.getEmployer().getId().equals(employer.getId())) throw new ApiException(HttpStatus.FORBIDDEN,"Not your job");
        return repo.findByJobOrderByAppliedAtDesc(job).stream().map(this::toDto).toList();
    }
    public ApplicationResponse updateStatus(Long appId, String status, User employer) {
        Application a = repo.findById(appId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,"Application not found"));
        if (!a.getJob().getEmployer().getId().equals(employer.getId())) throw new ApiException(HttpStatus.FORBIDDEN,"Not allowed");
        String old = a.getStatus();
        a.setStatus(status);
        Application saved = repo.save(a);
        audit.log("STATUS_CHANGE", "Application", saved.getId(), employer,
                "Status changed from " + old + " to " + status);
        return toDto(saved);
    }
}
