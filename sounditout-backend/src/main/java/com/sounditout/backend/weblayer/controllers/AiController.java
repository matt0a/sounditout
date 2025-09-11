package com.sounditout.backend.weblayer.controllers;

import com.sounditout.backend.domainLayer.entity.ProgressReport;
import com.sounditout.backend.domainLayer.entity.StudyPlan;
import com.sounditout.backend.repositories.ProgressReportRepository;
import com.sounditout.backend.repositories.ReportEmbeddingRepository;
import com.sounditout.backend.repositories.StudentRepository;
import com.sounditout.backend.security.CustomUserDetails;
import com.sounditout.backend.services.StudyAiService;
import com.sounditout.backend.services.StudyCoachService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Validated
public class AiController {

    private final StudyAiService studyAiService;
    private final StudyCoachService studyCoachService;
    private final ReportEmbeddingRepository embeddingRepo;
    private final StudentRepository studentRepository;
    private final ProgressReportRepository progressReportRepository;

    // ---------- 1) Upsert an embedding for a report ----------
    @PostMapping("/reports/{reportId}/embed")
    public ResponseEntity<?> upsertEmbedding(
            @PathVariable Long reportId,
            @Valid @RequestBody UpsertEmbeddingRequest body,
            Authentication auth
    ) {
        if (!(auth.getPrincipal() instanceof CustomUserDetails cud)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long userId = cud.getId();
        Long studentId = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"))
                .getId();

        // 1a) Ensure the report exists AND belongs to this student
        ProgressReport report = progressReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getStudent().getId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: report does not belong to you"));
        }

        // 1b) Basic guard against empty content (validation already requires @NotBlank)
        studyAiService.upsertReportEmbedding(studentId, reportId, body.getSubject(), body.getContent());

        return ResponseEntity.created(URI.create("/api/ai/reports/" + reportId + "/embed")).build();
    }

    @Data
    public static class UpsertEmbeddingRequest {
        private String subject;     // optional
        @NotBlank
        private String content;     // report text
    }

    // ---------- 2) Generate & persist a weekly plan ----------
    @GetMapping("/study-plan")
    public ResponseEntity<?> generatePlan(
            @RequestParam @NotBlank String goal,
            Authentication auth
    ) {
        if (!(auth.getPrincipal() instanceof CustomUserDetails cud)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long userId = cud.getId();
        Long studentId = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"))
                .getId();

        StudyPlan plan = studyCoachService.generateWeeklyPlan(studentId, goal);
        return ResponseEntity.ok(plan);
    }

    // ---------- 3) (Optional) Search top-K similar chunks ----------
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam @NotBlank String query,
            @RequestParam(defaultValue = "5") @Min(1) int k,
            Authentication auth
    ) {
        if (!(auth.getPrincipal() instanceof CustomUserDetails cud)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long userId = cud.getId();
        Long studentId = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"))
                .getId();

        var result = studyCoachService.searchTopK(studentId, query, k);
        return ResponseEntity.ok(Map.of(
                "studentId", studentId,
                "query", query,
                "k", k,
                "results", result
        ));
    }
}
