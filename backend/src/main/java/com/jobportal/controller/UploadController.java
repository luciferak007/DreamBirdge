package com.jobportal.controller;

import com.jobportal.exception.ApiException;
import com.jobportal.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;

/**
 * Resume upload endpoint.
 *
 *  POST /api/uploads/resume         (multipart/form-data, field "file")  -> { "url": "/api/uploads/resume/<filename>" }
 *  GET  /api/uploads/resume/{name}  -> serves the file (PDF/DOC/DOCX)
 *
 *  Files are stored on disk under `app.upload.dir` (default: ./uploads/resumes).
 *  Allowed: pdf, doc, docx. Max size enforced by Spring (see application.properties).
 */
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    @Value("${app.upload.dir:./uploads/resumes}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "doc", "docx");
    private static final long MAX_BYTES = 5L * 1024 * 1024; // 5 MB

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadResume(@RequestParam("file") MultipartFile file,
                                            @AuthenticationPrincipal UserPrincipal p) {
        if (file == null || file.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "No file provided");
        if (file.getSize() > MAX_BYTES) throw new ApiException(HttpStatus.BAD_REQUEST, "File too large (max 5MB)");

        String original = Optional.ofNullable(file.getOriginalFilename()).orElse("resume");
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) ext = original.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXT.contains(ext)) throw new ApiException(HttpStatus.BAD_REQUEST, "Only PDF, DOC, DOCX allowed");

        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String safeName = "u" + (p != null ? p.getUser().getId() : "anon")
                    + "-" + System.currentTimeMillis()
                    + "-" + UUID.randomUUID().toString().substring(0, 8) + "." + ext;
            Path target = dir.resolve(safeName);
            file.transferTo(target.toFile());
            String url = "/api/uploads/resume/" + safeName;
            return Map.of("url", url, "filename", safeName, "originalName", original);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/resume/{name:.+}")
    public ResponseEntity<Resource> serveResume(@PathVariable String name) {
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path file = dir.resolve(name).normalize();
            if (!file.startsWith(dir) || !Files.exists(file))
                throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
            Resource res = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            if (contentType == null) contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + name + "\"")
                    .body(res);
        } catch (MalformedURLException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
        } catch (java.io.IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Read failed");
        }
    }
}
