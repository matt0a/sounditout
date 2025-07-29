package com.sounditout.backend.repositories;

import com.sounditout.backend.domainLayer.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);

    List<Student> findByFullNameContainingIgnoreCase(String fullName);

    Long id(Long id);

}

