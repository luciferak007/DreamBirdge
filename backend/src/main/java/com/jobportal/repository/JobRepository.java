package com.jobportal.repository;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrueOrderByPostedAtDesc();
    List<Job> findByEmployerOrderByPostedAtDesc(User employer);
    @Query("select j from Job j where j.active=true and " +
           "(lower(j.title) like lower(concat('%',?1,'%')) or lower(j.company) like lower(concat('%',?1,'%')) or lower(j.location) like lower(concat('%',?1,'%')) or lower(j.category) like lower(concat('%',?1,'%')))")
    List<Job> search(String q);
}
