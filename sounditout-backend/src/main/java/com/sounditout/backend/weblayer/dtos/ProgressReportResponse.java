package com.sounditout.backend.weblayer.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgressReportResponse {

    private Long id;
    private LocalDate date;
    private String lessonTopic;
    private int initialGradeLevel;
    private int difficulty;
    private String milestone;
    private String notes;
    private Long studentId;
}
