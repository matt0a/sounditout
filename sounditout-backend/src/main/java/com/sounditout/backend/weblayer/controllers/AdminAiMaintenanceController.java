package com.sounditout.backend.weblayer.controllers;

import com.sounditout.backend.repositories.ReportEmbeddingRepository;
import com.sounditout.backend.services.ProgressReportService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminAiMaintenanceController {

    private final ProgressReportService progressReportService;
    private final ReportEmbeddingRepository embeddingRepo;

    /** Rebuild embeddings for all reports of a student (keeps existing rows). */
    @PostMapping("/reindex")
    public ResponseEntity<?> reindex(@RequestParam @Min(1) Long studentId) {
        int count = progressReportService.reindexStudentReports(studentId);
        return ResponseEntity.ok(Map.of(
                "studentId", studentId,
                "reindexed", count
        ));
    }

    /** Optional: purge all embeddings for the student then rebuild. */
    @PostMapping("/purge-and-reindex")
    public ResponseEntity<?> purgeAndReindex(@RequestParam @Min(1) Long studentId) {
        // You can implement a delete method per student; see repo snippet below.
        int deleted = embeddingRepo.deleteAllForStudent(studentId);
        int reindexed = progressReportService.reindexStudentReports(studentId);
        return ResponseEntity.ok(Map.of(
                "studentId", studentId,
                "deleted", deleted,
                "reindexed", reindexed
        ));
    }
}
