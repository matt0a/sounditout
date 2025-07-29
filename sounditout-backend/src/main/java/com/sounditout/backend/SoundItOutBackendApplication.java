package com.sounditout.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SoundItOutBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SoundItOutBackendApplication.class, args);
	}

}
