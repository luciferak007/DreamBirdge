package com.jobportal.controller;
import com.jobportal.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
public class UserController {
    @GetMapping("/me")
    public Map<String,Object> me(@AuthenticationPrincipal UserPrincipal p) {
        var u = p.getUser();
        return Map.of("id", u.getId(), "email", u.getEmail(), "fullName", u.getFullName(),
                "role", u.getRole(), "headline", u.getHeadline()==null?"":u.getHeadline(),
                "bio", u.getBio()==null?"":u.getBio(), "company", u.getCompany()==null?"":u.getCompany());
    }
}
