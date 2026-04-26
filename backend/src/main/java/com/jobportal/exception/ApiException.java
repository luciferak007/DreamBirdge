package com.jobportal.exception;
import org.springframework.http.HttpStatus;
import lombok.Getter;
@Getter
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    public ApiException(HttpStatus status, String msg) { super(msg); this.status = status; }
}
