package com.sounditout.backend.services;

import com.sounditout.backend.domainLayer.entity.ProgressReport;
import com.sounditout.backend.domainLayer.entity.Student;
import com.sounditout.backend.repositories.ProgressReportRepository;
import com.sounditout.backend.repositories.StudentRepository;
import com.sounditout.backend.weblayer.dtos.ProgressReportDTO;
import com.sounditout.backend.weblayer.dtos.ProgressReportResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ProgressReportService {

    private final ProgressReportRepository progressReportRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public ProgressReport create(Long studentId, @Valid ProgressReportDTO dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        ProgressReport report = ProgressReport.builder()
                .student(student)
                .date(LocalDate.now()) // or dto.getDate() if you expose that
                .lessonTopic(dto.getLessonTopic())
                .difficulty(dto.getDifficulty())
                .initialGradeLevel(dto.getInitialGradeLevel())
                .milestone(dto.getMilestone())
                .notes(dto.getNotes())
                .accomplishments(dto.getAccomplishments())
                .improvementsNeeded(dto.getImprovementsNeeded())
                .build();

        return progressReportRepository.save(report);
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
    }

    @Transactional
    public ProgressReport update(Long id, @Valid ProgressReportDTO dto) {
        ProgressReport report = progressReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));


        report.setLessonTopic(dto.getLessonTopic());
        report.setInitialGradeLevel(dto.getInitialGradeLevel());
        report.setDifficulty(dto.getDifficulty());
        report.setMilestone(dto.getMilestone());
        report.setNotes(dto.getNotes());
        report.setAccomplishments(dto.getAccomplishments());
        report.setImprovementsNeeded(dto.getImprovementsNeeded());

        return progressReportRepository.save(report);
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

}
