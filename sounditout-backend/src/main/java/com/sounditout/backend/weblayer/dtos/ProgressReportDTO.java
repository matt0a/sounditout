package com.sounditout.backend.weblayer.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProgressReportDTO {

    @NotBlank
    private String lessonTopic;

    private int difficulty;

    private int initialGradeLevel;

    private String milestone;

    private String notes;
}
