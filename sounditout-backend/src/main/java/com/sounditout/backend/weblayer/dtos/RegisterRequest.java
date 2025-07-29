package com.sounditout.backend.weblayer.dtos;

import com.sounditout.backend.domainLayer.enums.GradeRange;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank
    private String fullName;

    @NotNull
    private GradeRange gradeRange;

    @Min(5)
    @Max(20)
    private int age;
}


