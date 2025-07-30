package com.sounditout.backend.repositories;

import com.sounditout.backend.domainLayer.entity.User;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByEmail(String email);

    // Optional: explicit delete method (JpaRepository already provides deleteById)
    void deleteById(@NonNull Long id);

}

