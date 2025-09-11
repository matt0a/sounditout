package com.sounditout.backend.security;

import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class JpaSmokeTest implements CommandLineRunner {
    private final EntityManagerFactory emf;
    @Override public void run(String... args) {
        System.out.println("EMF OK? " + emf.isOpen());
    }
}