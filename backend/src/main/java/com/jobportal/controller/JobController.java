package com.jobportal.controller;
import com.jobportal.dto.JobDtos.*;
import com.jobportal.security.UserPrincipal;
import com.jobportal.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/jobs") @RequiredArgsConstructor
public class JobController {
    private final JobService service;
    @GetMapping("/public") public List<JobResponse> publicList(@RequestParam(required=false) String q) { return service.list(q); }
    @GetMapping("/public/{id}") public JobResponse publicGet(@PathVariable Long id) { return service.get(id); }
    @GetMapping public List<JobResponse> list(@RequestParam(required=false) String q) { return service.list(q); }
    @GetMapping("/{id}") public JobResponse get(@PathVariable Long id) { return service.get(id); }
    @GetMapping("/mine") public List<JobResponse> mine(@AuthenticationPrincipal UserPrincipal p) { return service.myJobs(p.getUser()); }
    @PostMapping public JobResponse create(@Valid @RequestBody JobRequest r, @AuthenticationPrincipal UserPrincipal p) { return service.create(r, p.getUser()); }
    @PutMapping("/{id}") public JobResponse update(@PathVariable Long id, @Valid @RequestBody JobRequest r, @AuthenticationPrincipal UserPrincipal p) { return service.update(id, r, p.getUser()); }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal p) { service.delete(id, p.getUser()); }
}
