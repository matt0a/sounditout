package com.sounditout.backend.weblayer.dtos;

import com.sounditout.backend.domainLayer.enums.GradeRange;
import com.sounditout.backend.domainLayer.enums.StudentGroup;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentDTO {

    @NotBlank
    private String fullName;

    @NotNull
    private GradeRange grade;

    private StudentGroup studentGroup;

    @Min(3)
    @Max(40)
    private int age;
}
