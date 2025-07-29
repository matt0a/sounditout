package com.sounditout.backend.weblayer.dtos;

import com.sounditout.backend.domainLayer.enums.GradeRange;
import com.sounditout.backend.domainLayer.enums.StudentGroup;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponse {

    private Long id;
    private String fullName;
    private GradeRange grade;
    private StudentGroup studentGroup;
    private int age;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
