package com.sounditout.backend.services;

import com.sounditout.backend.weblayer.dtos.YouTubeVideo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class YouTubeSearchService {

    @Value("${youtube.api-key}")           // <-- uses youtube.api-key
    private String apiKey;

    private final RestClient restClient = RestClient.builder().build();

    /** Normalize a topic to improve caching hit rate (case/punctuation insensitive). */
    private static String normalizeTopic(String topic) {
        if (topic == null) return "";
        String t = topic.trim().toLowerCase();
        return t.replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // helper for SpEL key
    public static String norm(String s) {
        return normalizeTopic(s);
    }

    /**
     * Cached YouTube search.
     * Cache key: md5(normalizedTopic) + ":" + max.
     * TTL/size is controlled in your Caffeine cache config.
     */
    @Cacheable(
            value = "ytSearch",
            key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(T(com.sounditout.backend.services.YouTubeSearchService).norm(#topic).bytes) + ':' + #max",
            unless = "#result == null || #result.isEmpty()"
    )
    public List<YouTubeVideo> searchVideos(String topic, int max) {
        String normalized = normalizeTopic(topic);
        if (normalized.isBlank() || apiKey == null || apiKey.isBlank()) {
            return List.of();
        }

        int maxResults = Math.min(Math.max(max, 1), 10); // clamp 1..10
        String q = URLEncoder.encode(normalized, StandardCharsets.UTF_8);

        String url = "https://www.googleapis.com/youtube/v3/search"
                + "?part=snippet&type=video&maxResults=" + maxResults
                + "&q=" + q
                + "&key=" + apiKey;

        // Fetch as Map<String, Object> safely
        ParameterizedTypeReference<Map<String, Object>> typeRef =
                new ParameterizedTypeReference<>() {};
        Map<String, Object> payload = restClient.get()
                .uri(url)
                .retrieve()
                .body(typeRef);

        if (payload == null) return List.of();

        Object itemsObj = payload.get("items");
        if (!(itemsObj instanceof List<?> rawItems)) {
            return List.of();
        }

        List<YouTubeVideo> out = new ArrayList<>(rawItems.size());

        for (Object o : rawItems) {
            if (!(o instanceof Map<?, ?> itemAny)) continue;

            // id
            Object idObj = itemAny.get("id");
            if (!(idObj instanceof Map<?, ?> idAny)) continue;
            Object videoIdObj = idAny.get("videoId");
            if (!(videoIdObj instanceof String videoId) || videoId.isBlank()) continue;

            // snippet
            Object snObj = itemAny.get("snippet");
            if (!(snObj instanceof Map<?, ?> snAny)) continue;

            String title         = safeString(snAny.get("title"));
            String channelTitle  = safeString(snAny.get("channelTitle"));
            String description   = safeString(snAny.get("description"));
            String publishedAt   = safeString(snAny.get("publishedAt"));
            String urlVideo      = "https://www.youtube.com/watch?v=" + videoId;

            String thumbnailUrl = null;
            Object thumbsObj = snAny.get("thumbnails");
            if (thumbsObj instanceof Map<?, ?> thumbsAny) {
                // prefer "high", fallback to "medium"
                thumbnailUrl = extractThumbUrl(thumbsAny, "high");
                if (thumbnailUrl == null) {
                    thumbnailUrl = extractThumbUrl(thumbsAny, "medium");
                }
            }

            out.add(new YouTubeVideo(
                    title, urlVideo, channelTitle, description, publishedAt, thumbnailUrl
            ));
        }

        return out;
    }

    private static String safeString(Object v) {
        return v instanceof String s ? s : "";
    }

    @SuppressWarnings("unchecked")
    private static String extractThumbUrl(Map<?, ?> thumbsAny, String key) {
        Object tier = thumbsAny.get(key);
        if (tier instanceof Map<?, ?> tierAny) {
            Object url = tierAny.get("url");
            if (url instanceof String s && !s.isBlank()) return s;
        }
        return null;
    }
}
