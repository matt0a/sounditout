package com.sounditout.backend.weblayer.controllers;

import com.sounditout.backend.domainLayer.entity.ProgressReport;
import com.sounditout.backend.security.CustomUserDetails;
import com.sounditout.backend.services.ProgressReportService;
import com.sounditout.backend.services.StudentService;
import com.sounditout.backend.weblayer.dtos.ProgressReportDTO;
import com.sounditout.backend.weblayer.dtos.ProgressReportResponse;
import com.sounditout.backend.weblayer.dtos.StudentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.lang.System.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ProgressReportController {

    private final ProgressReportService reportService;
    private final StudentService studentService;

    @PostMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProgressReportResponse> submitReport(
            @PathVariable Long studentId,
            @Valid @RequestBody ProgressReportDTO dto) {

        ProgressReport report = reportService.create(studentId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.toResponse(report));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProgressReportResponse>> getReports(@PathVariable Long studentId) {
        return ResponseEntity.ok(reportService.getByStudent(studentId).stream()
                .map(reportService::toResponse).toList());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ProgressReportResponse>> getMyReports(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId(); // Ensure this returns the User's ID

        out.println("🔍 Authenticated User ID: " + userId);

        List<ProgressReport> reports = reportService.getByUserId(userId);

        return ResponseEntity.ok(reports.stream()
                .map(reportService::toResponse)
                .toList());
    }
}
