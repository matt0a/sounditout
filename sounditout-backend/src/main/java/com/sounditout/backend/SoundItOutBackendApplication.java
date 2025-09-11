package com.sounditout.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.sounditout.backend")
@EntityScan(basePackages = "com.sounditout.backend.domainLayer.entity")
@EnableJpaRepositories(basePackages = "com.sounditout.backend.repositories")
@EnableJpaAuditing
public class SoundItOutBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SoundItOutBackendApplication.class, args);
	}

}
