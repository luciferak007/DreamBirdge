package com.jobportal.controller;
import com.jobportal.dto.ApplicationDtos.*;
import com.jobportal.security.UserPrincipal;
import com.jobportal.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/applications") @RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService service;
    @PostMapping public ApplicationResponse apply(@Valid @RequestBody ApplyRequest r, @AuthenticationPrincipal UserPrincipal p) { return service.apply(r, p.getUser()); }
    @GetMapping("/mine") public List<ApplicationResponse> mine(@AuthenticationPrincipal UserPrincipal p) { return service.mine(p.getUser()); }
    @GetMapping("/job/{jobId}") public List<ApplicationResponse> forJob(@PathVariable Long jobId, @AuthenticationPrincipal UserPrincipal p) { return service.forJob(jobId, p.getUser()); }
    @PutMapping("/{id}/status") public ApplicationResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdate u, @AuthenticationPrincipal UserPrincipal p) { return service.updateStatus(id, u.getStatus(), p.getUser()); }
}
