package com.sounditout.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sounditout.backend.domainLayer.entity.StudyPlan;
import com.sounditout.backend.repositories.ReportEmbeddingRepository;
import com.sounditout.backend.repositories.StudyPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudyCoachService {

    private final EmbeddingModel embeddingModel;
    private final OpenAiChatModel chatModel;
    private final ReportEmbeddingRepository embeddingRepo;
    private final StudyPlanRepository planRepo;
    private final ObjectMapper objectMapper;

    /**
     * Generate and persist a one-week study plan for a student.
     * - Embed the student's goal
     * - Retrieve most relevant prior report snippets (RAG)
     * - Ask the chat model for STRICT-JSON plan and store it as jsonb
     */
    @Transactional
    public StudyPlan generateWeeklyPlan(Long studentId, String goalPrompt) {
        // 1) Embed the student's goal (M2 returns List<float[]> when you pass List<String>)
        List<float[]> vectors = embeddingModel.embed(List.of(goalPrompt));
        float[] vectorArray = vectors.get(0);
        String qLiteral = toVectorLiteral(vectorArray);

        // 2) Retrieve top-k prior report snippets for this student (RAG context)
        List<Object[]> rows = embeddingRepo.searchTopKRaw(studentId, qLiteral, 6);
        StringBuilder ctx = new StringBuilder();
        for (Object[] r : rows) {
            // row = [id, student_id, report_id, subject, content, created_at]
            String subject = r[3] != null ? r[3].toString() : "";
            String content = r[4] != null ? r[4].toString() : "";
            ctx.append("Subject: ").append(subject).append("\n");
            ctx.append("Content: ").append(content).append("\n---\n");
        }

        // 3) Ask the model to produce STRICT JSON for the weekly plan
        String sys = """
                You are a tutoring coach. Create a realistic one-week study plan.
                Use the student's past feedback (RAG context) to be specific.
                Output STRICT JSON only with this schema (no extra text):
                {
                  "week_start": "YYYY-MM-DD",
                  "goals": "string",
                  "tasks": [
                    { "day": "Mon|Tue|Wed|Thu|Fri|Sat|Sun", "title": "string", "steps": ["string", ...] }
                  ]
                }
                """;

        String user = """
                Student goal: %s

                RAG context:
                %s
                """.formatted(goalPrompt, ctx);

        ChatResponse reply = chatModel.call(new Prompt(
                List.of(new SystemMessage(sys), new UserMessage(user))
        ));

        String strictJson = reply.getResult().getOutput().getContent(); // STRICT JSON from the model

        // Parse JSON into JsonNode so Hibernate Types can store it as jsonb
        final JsonNode tasksNode;
        try {
            tasksNode = objectMapper.readTree(strictJson);
        } catch (Exception e) {
            throw new IllegalArgumentException("Model did not return valid JSON for study plan.", e);
        }

        // 4) Persist plan (week starts on Monday in UTC)
        LocalDate monday = LocalDate.now(ZoneOffset.UTC).with(DayOfWeek.MONDAY);
        StudyPlan plan = StudyPlan.builder()
                .studentId(studentId)
                .weekStart(monday)
                .goals(goalPrompt)
                .tasks(tasksNode) // <-- store as JSONB
                .build();

        return planRepo.save(plan);
    }

    /**
     * Helper used by the /api/ai/search endpoint to inspect the top-K nearest
     * report snippets for a student.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchTopK(Long studentId, String query, int k) {
        List<float[]> vectors = embeddingModel.embed(List.of(query));
        String literal = toVectorLiteral(vectors.get(0));

        List<Object[]> rows = embeddingRepo.searchTopKRaw(studentId, literal, k);

        return rows.stream().map(r -> Map.of(
                "id", r[0],
                "student_id", r[1],
                "report_id", r[2],
                "subject", r[3],
                "content", r[4],
                "created_at", r[5]
        )).toList();
    }

    /** Convert float[] vector to pgvector literal: "[v1,v2,...]". */
    private static String toVectorLiteral(float[] v) {
        StringBuilder sb = new StringBuilder(v.length * 10);
        sb.append('[');
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(String.format(Locale.ROOT, "%.6f", v[i]));
        }
        sb.append(']');
        return sb.toString();
    }
}
