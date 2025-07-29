package com.sounditout.backend.domainLayer.enums;

import lombok.Getter;

@Getter
public enum GradeRange {
    GRADE_1_4("Grade 1–4"),
    GRADE_5_6("Grade 5–6"),
    GRADE_7_9("Grade 7–9"),
    GRADE_10_12("Grade 10–12");

    private final String displayName;

    GradeRange(String displayName) {
        this.displayName = displayName;
    }
}

