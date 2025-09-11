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

}
