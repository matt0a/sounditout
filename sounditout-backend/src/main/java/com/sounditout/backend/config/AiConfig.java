package com.sounditout.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.embedding.EmbeddingModel;


@Configuration
public class AiConfig {

    @Bean
    public OpenAiApi openAiApi(@Value("${spring.ai.openai.api-key}") String apiKey) {
        return new OpenAiApi(apiKey);
    }

    @Bean
    public OpenAiChatModel chatModel(OpenAiApi api) {
        return new OpenAiChatModel(api);
    }

    @Bean
    public EmbeddingModel embeddingModel(OpenAiApi api) {
        return new OpenAiEmbeddingModel(api);
    }
}
