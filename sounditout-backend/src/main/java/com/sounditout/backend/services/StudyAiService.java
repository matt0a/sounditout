package com.sounditout.backend.services;

import com.sounditout.backend.repositories.ReportEmbeddingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class StudyAiService {

    // org.springframework.ai.embedding.EmbeddingModel (M2)
    private final EmbeddingModel embeddingModel;
    private final ReportEmbeddingRepository embeddingRepo;

    @Async("aiExecutor")
    @Transactional
    public void upsertReportEmbedding(Long studentId, Long reportId, String subject, String content) {
        // Build a single string for embedding (RAG-friendly)
        String safeSubject = subject == null ? "" : subject;
        String safeContent = content == null ? "" : content;

        String doc = """
                Subject: %s

                %s
                """.formatted(safeSubject, safeContent);

        // M2 API: embed(String) -> float[]
        float[] vector = embeddingModel.embed(doc);

        // Convert to pgvector literal: [v1,v2,...]
        String literal = toVectorLiteral(vector);

        // Persist via your native query
        embeddingRepo.insertEmbedding(studentId, reportId, subject, content, literal);
    }

    private static String toVectorLiteral(float[] v) {
        StringBuilder sb = new StringBuilder(v.length * 10);
        sb.append('[');
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(',');
            // keep a stable decimal format for Postgres
            sb.append(String.format(Locale.ROOT, "%.6f", v[i]));
        }
        sb.append(']');
        return sb.toString();
    }
}
