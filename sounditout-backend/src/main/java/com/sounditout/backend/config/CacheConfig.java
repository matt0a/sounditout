// com.sounditout.backend.config.CacheConfig
package com.sounditout.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager mgr = new CaffeineCacheManager("ytSearch");
        mgr.setCaffeine(Caffeine.newBuilder()
                .maximumSize(2_000)                     // adjust as you like
                .expireAfterWrite(Duration.ofHours(24)) // 24h TTL
        );
        return mgr;
    }
}
