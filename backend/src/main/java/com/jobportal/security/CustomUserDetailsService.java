package com.jobportal.security;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository repo;
    @Override public UserDetails loadUserByUsername(String email) {
        return repo.findByEmail(email).map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: "+email));
    }
}
