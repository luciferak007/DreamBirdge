package com.jobportal.repository;
import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByApplicantOrderByAppliedAtDesc(User applicant);
    List<Application> findByJobOrderByAppliedAtDesc(Job job);
    Optional<Application> findByJobAndApplicant(Job job, User applicant);
    boolean existsByJobAndApplicant(Job job, User applicant);
}
