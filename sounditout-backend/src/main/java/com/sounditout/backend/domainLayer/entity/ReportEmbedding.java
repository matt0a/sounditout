package com.sounditout.backend.domainLayer.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "report_embedding")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    private String subject;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    // created in DB with DEFAULT now()
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    // NOTE: we do NOT map the `embedding vector(1536)` column here.
}
