package com.sounditout.backend.services;

import com.sounditout.backend.weblayer.dtos.ProgressReportDTO;
import com.sounditout.backend.domainLayer.entity.ProgressReport;
import com.sounditout.backend.domainLayer.entity.Student;
import com.sounditout.backend.weblayer.dtos.ProgressReportResponse;
import com.sounditout.backend.repositories.ProgressReportRepository;
import com.sounditout.backend.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ProgressReportService {

    private final ProgressReportRepository progressReportRepository;
    private final StudentRepository studentRepository;

    // 🔗 NEW: AI embedding service
    private final StudyAiService studyAiService;

    @Transactional
    public ProgressReport create(Long studentId, @Valid ProgressReportDTO dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        ProgressReport report = ProgressReport.builder()
                .student(student)
                .date(dto.getDate())
                .lessonTopic(dto.getLessonTopic())
                .difficulty(dto.getDifficulty())
                .initialGradeLevel(dto.getInitialGradeLevel())
                .milestone(dto.getMilestone())
                .notes(dto.getNotes())
                .accomplishments(dto.getAccomplishments())
                .improvementsNeeded(dto.getImprovementsNeeded())
                .build();

        ProgressReport saved = progressReportRepository.save(report);

        // 🧠 NEW: upsert embedding after save (soft-fail)
        try {
            String subject = nullToEmpty(saved.getLessonTopic());
            String content = buildEmbeddingContent(saved);
            studyAiService.upsertReportEmbedding(studentId, saved.getId(), subject, content);
        } catch (Exception e) {
            log.warn("Embedding upsert failed for report id={} (student id={}): {}",
                    saved.getId(), studentId, e.toString());
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<ProgressReport> getByStudent(Long studentId) {
        return progressReportRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Optional<ProgressReport> getById(Long progressReportId) {
        return progressReportRepository.findById(progressReportId);
    }

    public void delete(long id){
        if(!progressReportRepository.existsById(id)){
            throw new RuntimeException("Report not found");
        }
        progressReportRepository.deleteById(id);
        // Optional: also delete embeddings via a repo method if you add one
        // embeddingRepo.deleteByReportId(id);
    }

    @Transactional
    public ProgressReport update(Long id, @Valid ProgressReportDTO dto) {
        ProgressReport report = progressReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setDate(dto.getDate());
        report.setLessonTopic(dto.getLessonTopic());
        report.setInitialGradeLevel(dto.getInitialGradeLevel());
        report.setDifficulty(dto.getDifficulty());
        report.setMilestone(dto.getMilestone());
        report.setNotes(dto.getNotes());
        report.setAccomplishments(dto.getAccomplishments());
        report.setImprovementsNeeded(dto.getImprovementsNeeded());

        ProgressReport saved = progressReportRepository.save(report);

        // 🧠 NEW: re-upsert embedding after update (soft-fail)
        try {
            Long studentId = saved.getStudent().getId();
            String subject = nullToEmpty(saved.getLessonTopic());
            String content = buildEmbeddingContent(saved);
            studyAiService.upsertReportEmbedding(studentId, saved.getId(), subject, content);
        } catch (Exception e) {
            log.warn("Embedding re-upsert failed for report id={}: {}", saved.getId(), e.toString());
        }

        return saved;
    }

    public ProgressReportResponse toResponse(ProgressReport report) {
        return new ProgressReportResponse(
                report.getId(),
                report.getDate(),
                report.getLessonTopic(),
                report.getInitialGradeLevel(),
                report.getDifficulty(),
                report.getMilestone(),
                report.getNotes(),
                report.getStudent().getId(),
                report.getAccomplishments(),
                report.getImprovementsNeeded()
        );
    }

    public List<ProgressReport> getByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return progressReportRepository.findByStudentId(student.getId());
    }

    // ---------- Helpers ----------

    /** Build a concise text blob for embedding. */
    private static String buildEmbeddingContent(ProgressReport r) {
        StringBuilder sb = new StringBuilder(512);
        if (r.getNotes() != null && !r.getNotes().isBlank()) {
            sb.append("Notes: ").append(r.getNotes()).append('\n');
        }
        if (r.getAccomplishments() != null && !r.getAccomplishments().isBlank()) {
            sb.append("Accomplishments: ").append(r.getAccomplishments()).append('\n');
        }
        if (r.getImprovementsNeeded() != null && !r.getImprovementsNeeded().isBlank()) {
            sb.append("Improvements Needed: ").append(r.getImprovementsNeeded()).append('\n');
        }
        return sb.toString().isBlank() ? "No details provided." : sb.toString();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    // ✅ Optional utility to backfill/rebuild embeddings for a student
    @Transactional
    public int reindexStudentReports(Long studentId) {
        List<ProgressReport> reports = progressReportRepository.findByStudentId(studentId);
        int count = 0;
        for (ProgressReport r : reports) {
            try {
                String subject = nullToEmpty(r.getLessonTopic());
                String content = buildEmbeddingContent(r);
                studyAiService.upsertReportEmbedding(studentId, r.getId(), subject, content);
                count++;
            } catch (Exception e) {
                log.warn("Reindex skipped report id={} due to error: {}", r.getId(), e.toString());
            }
        }
        return count;
    }
}
