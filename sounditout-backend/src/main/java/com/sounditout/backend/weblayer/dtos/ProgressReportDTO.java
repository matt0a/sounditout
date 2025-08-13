package com.sounditout.backend.weblayer.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProgressReportDTO {

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd") // matches your <input type="date">
    private LocalDate date;

    @NotBlank
    private String lessonTopic;

    private int difficulty;

    private int initialGradeLevel;

    private String milestone;

    private String notes;

    private String accomplishments;

    private String improvementsNeeded;
}
