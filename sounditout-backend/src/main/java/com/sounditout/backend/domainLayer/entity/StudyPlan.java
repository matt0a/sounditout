package com.sounditout.backend.domainLayer.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDate;

@Entity
@Table(name = "study_plan")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudyPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Column(name = "goals")
    private String goals;

    @Type(JsonType.class)
    @Column(name = "tasks", columnDefinition = "jsonb", nullable = false)
    private JsonNode tasks;
}
