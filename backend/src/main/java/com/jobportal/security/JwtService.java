package com.jobportal.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
@Service
public class JwtService {
    @Value("${app.jwt.secret}") private String secret;
    @Value("${app.jwt.expiration-ms}") private long expirationMs;
    private SecretKey key() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); }
    public String generate(String email, Map<String,Object> claims) {
        return Jwts.builder().claims(claims).subject(email)
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+expirationMs))
                .signWith(key()).compact();
    }
    public String extractEmail(String token) { return parse(token, Claims::getSubject); }
    public boolean isValid(String token, String email) {
        try { return email.equals(extractEmail(token)) && parse(token, Claims::getExpiration).after(new Date()); }
        catch (Exception e) { return false; }
    }
    private <T> T parse(String token, Function<Claims,T> f) {
        return f.apply(Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload());
    }
}
