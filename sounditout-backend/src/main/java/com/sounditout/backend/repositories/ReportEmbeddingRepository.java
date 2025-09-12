package com.sounditout.backend.repositories;

import com.sounditout.backend.domainLayer.entity.ReportEmbedding;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ReportEmbeddingRepository extends JpaRepository<ReportEmbedding, Long> {

    @Modifying
    @Query(value = """
        INSERT INTO report_embedding (student_id, report_id, subject, content, embedding)
        VALUES (:studentId, :reportId, :subject, :content, CAST(:embeddingLiteral AS vector(1536)))
        """, nativeQuery = true)
    void insertEmbedding(@Param("studentId") Long studentId,
                         @Param("reportId") Long reportId,
                         @Param("subject") String subject,
                         @Param("content") String content,
                         @Param("embeddingLiteral") String embeddingLiteral);

    @Query(value = """
        SELECT id, student_id, report_id, subject, content, created_at
        FROM report_embedding
        WHERE student_id = :studentId
        ORDER BY embedding <=> CAST(:queryEmbeddingLiteral AS vector(1536))
        LIMIT :k
        """, nativeQuery = true)
    List<Object[]> searchTopKRaw(@Param("studentId") Long studentId,
                                 @Param("queryEmbeddingLiteral") String queryEmbeddingLiteral,
                                 @Param("k") int k);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM report_embedding WHERE student_id = :studentId", nativeQuery = true)
    int deleteAllForStudent(@Param("studentId") Long studentId);

    /**
     * Nearest-neighbor search returning cosine similarity (score).
     * We sort by distance (smaller is closer) but also return score = 1 - distance.
     * Optional subject filter (case-insensitive, contains).
     *
     * Row: [id, student_id, report_id, subject, content, created_at, score]
     */
    @Query(value = """
        SELECT
            id,
            student_id,
            report_id,
            subject,
            content,
            created_at,
            1 - (embedding <=> CAST(:qvec AS vector)) AS score
        FROM report_embedding
        WHERE student_id = :studentId
          AND ( :subject IS NULL OR :subject = '' OR subject ILIKE CONCAT('%', :subject, '%') )
        ORDER BY embedding <=> CAST(:qvec AS vector)
        LIMIT :k
        """, nativeQuery = true)
    List<Object[]> searchTopKWithScore(
            @Param("studentId") Long studentId,
            @Param("qvec") String queryVecLiteral,
            @Param("k") int k,
            @Param("subject") String subjectFilter // nullable
    );

}
