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
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyCoachService {

    private static final double SIMILARITY_CUTOFF = 0.75; // discard weak matches
    private static final int RAG_CANDIDATES = 12;         // fetch more, then filter
    private static final int RAG_MAX = 6;                 // final context size

    private final EmbeddingModel embeddingModel;
    private final OpenAiChatModel chatModel;
    private final ReportEmbeddingRepository embeddingRepo;
    private final StudyPlanRepository planRepo;
    private final ObjectMapper objectMapper;

    @Transactional
    public StudyPlan generateWeeklyPlan(Long studentId, String goalPrompt) {
        // ---------- 1) Embed goal ----------
        List<float[]> vectors = embeddingModel.embed(List.of(goalPrompt));
        String qLiteral = toVectorLiteral(vectors.get(0));

        // ---------- 2) Retrieve RAG rows (with score) ----------
        List<Object[]> raw = embeddingRepo.searchTopKWithScore(studentId, qLiteral, RAG_CANDIDATES, null);
        List<Object[]> filtered = raw.stream()
                .filter(r -> r[6] instanceof Number n && n.doubleValue() >= SIMILARITY_CUTOFF)
                .limit(RAG_MAX)
                .toList();

        boolean noRelevantContext = filtered.isEmpty();
        String ctx = noRelevantContext ? "(no prior relevant context)" : buildContext(filtered);

        // ---------- 3) Ask the model for STRICT JSON ----------
        String sys = """
        You are a tutoring coach. Create a realistic one-week study plan.
        Use the student's past feedback (RAG context) ONLY if it is relevant.
        If the RAG context equals "(no prior relevant context)", ignore it and base the plan solely on the student's goal.
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

        // Tell OpenAI we want a JSON object back
        var opts = OpenAiChatOptions.builder()
                .withTemperature(0.3f)
                .withResponseFormat(new OpenAiApi.ChatCompletionRequest.ResponseFormat(OpenAiApi.ChatCompletionRequest.ResponseFormat.Type.JSON_OBJECT)) // ✅ correct
                .build();


        String content = callForJson(sys, user, opts); // one place to call/chat and get content as string

        // ---------- 3b) Parse; if it fails, throw a clear 4xx so the FE can show a nice error ----------
        JsonNode root;
        try {
            root = objectMapper.readTree(content);     // <-- JSON parse
        } catch (Exception parseEx) {
            throw new IllegalStateException("Model did not return valid JSON for study plan");
        }

        // We store just the tasks array in the 'tasks' jsonb column.
        // If the model returned the whole object, extract tasks; if it returned tasks directly, use it as-is.
        JsonNode tasksNode = root.has("tasks") ? root.get("tasks") : root;
        if (tasksNode == null || !tasksNode.isArray()) {
            // Be strict: we expect an array for tasks
            throw new IllegalStateException("Model JSON did not contain a 'tasks' array");
        }

        // ---------- 4) Persist plan ----------
        LocalDate monday = LocalDate.now(ZoneOffset.UTC).with(DayOfWeek.MONDAY);

        StudyPlan plan = StudyPlan.builder()
                .studentId(studentId)
                .weekStart(monday)
                .goals(goalPrompt)
                .tasks(tasksNode)              // <-- pass JsonNode, not String
                .build();

        return planRepo.save(plan);
    }

    /** Tiny helper to call the chat model and return the raw content string. */
    private String callForJson(String sys, String user, OpenAiChatOptions opts) {
        ChatResponse reply = chatModel.call(
                new Prompt(List.of(new SystemMessage(sys), new UserMessage(user)), opts)
        );
        return reply.getResult().getOutput().getContent();
    }



    /** Exposed for debugging/search endpoint, with optional subject filter. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchTopK(Long studentId, String query, int k, String subjectFilter) {
        List<float[]> vectors = embeddingModel.embed(List.of(query));
        String literal = toVectorLiteral(vectors.get(0));

        List<Object[]> rows = embeddingRepo.searchTopKWithScore(
                studentId, literal, Math.max(k, RAG_CANDIDATES), subjectFilter
        );

        return rows.stream().map(r -> Map.of(
                "id", r[0],
                "student_id", r[1],
                "report_id", r[2],
                "subject", r[3],
                "content", r[4],
                "created_at", r[5],
                "score", r[6]
        )).limit(k).collect(Collectors.toList());
    }

    private static String buildContext(List<Object[]> rows) {
        StringBuilder ctx = new StringBuilder();
        for (Object[] r : rows) {
            String subject = r[3] != null ? r[3].toString() : "";
            String content = r[4] != null ? r[4].toString() : "";
            ctx.append("Subject: ").append(subject).append("\n");
            ctx.append("Content: ").append(content).append("\n---\n");
        }
        return ctx.toString();
    }

    /** Convert float[] to pgvector literal. */
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
