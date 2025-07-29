package com.sounditout.backend.weblayer.dtos;

import com.sounditout.backend.domainLayer.enums.StudentGroup;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentGroupAssignmentDTO {

    @NotNull
    private StudentGroup studentGroup;
}

