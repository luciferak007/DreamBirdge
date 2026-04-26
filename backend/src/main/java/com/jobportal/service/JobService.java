package com.jobportal.service;

import com.jobportal.dto.JobDtos.*;
import com.jobportal.exception.ApiException;
import com.jobportal.model.*;
import com.jobportal.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {
    private final JobRepository repo;
    private final AuditService audit;

    public JobResponse toDto(Job j) {
        return JobResponse.builder().id(j.getId()).title(j.getTitle()).company(j.getCompany())
                .location(j.getLocation()).type(j.getType()).category(j.getCategory())
                .salaryMin(j.getSalaryMin()).salaryMax(j.getSalaryMax())
                .description(j.getDescription()).requirements(j.getRequirements())
                .employerId(j.getEmployer().getId()).employerName(j.getEmployer().getFullName())
                .postedAt(j.getPostedAt()).active(j.isActive()).build();
    }
    public List<JobResponse> list(String q) {
        var list = (q == null || q.isBlank()) ? repo.findByActiveTrueOrderByPostedAtDesc() : repo.search(q);
        return list.stream().map(this::toDto).toList();
    }
    public JobResponse get(Long id) {
        return toDto(repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,"Job not found")));
    }
    public List<JobResponse> myJobs(User employer) {
        return repo.findByEmployerOrderByPostedAtDesc(employer).stream().map(this::toDto).toList();
    }
    public JobResponse create(JobRequest r, User employer) {
        if (employer.getRole() != Role.EMPLOYER) throw new ApiException(HttpStatus.FORBIDDEN,"Only employers can post jobs");
        Job j = Job.builder().title(r.getTitle()).company(r.getCompany()).location(r.getLocation())
                .type(r.getType()).category(r.getCategory()).salaryMin(r.getSalaryMin()).salaryMax(r.getSalaryMax())
                .description(r.getDescription()).requirements(r.getRequirements()).employer(employer).active(true).build();
        Job saved = repo.save(j);
        audit.log("CREATE", "Job", saved.getId(), employer, "Posted job '" + saved.getTitle() + "'");
        return toDto(saved);
    }
    public JobResponse update(Long id, JobRequest r, User employer) {
        Job j = repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,"Job not found"));
        if (!j.getEmployer().getId().equals(employer.getId())) throw new ApiException(HttpStatus.FORBIDDEN,"Not your job");
        j.setTitle(r.getTitle()); j.setCompany(r.getCompany()); j.setLocation(r.getLocation());
        j.setType(r.getType()); j.setCategory(r.getCategory()); j.setSalaryMin(r.getSalaryMin());
        j.setSalaryMax(r.getSalaryMax()); j.setDescription(r.getDescription()); j.setRequirements(r.getRequirements());
        Job saved = repo.save(j);
        audit.log("UPDATE", "Job", saved.getId(), employer, "Updated job '" + saved.getTitle() + "'");
        return toDto(saved);
    }
    public void delete(Long id, User employer) {
        Job j = repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,"Job not found"));
        if (!j.getEmployer().getId().equals(employer.getId())) throw new ApiException(HttpStatus.FORBIDDEN,"Not your job");
        repo.delete(j);
        audit.log("DELETE", "Job", id, employer, "Deleted job '" + j.getTitle() + "'");
    }
}
