package com.sounditout.backend.services;

import com.sounditout.backend.domainLayer.entity.Student;
import com.sounditout.backend.domainLayer.enums.StudentGroup;
import com.sounditout.backend.repositories.StudentRepository;
import com.sounditout.backend.repositories.UserRepository;
import com.sounditout.backend.weblayer.dtos.StudentDTO;
import com.sounditout.backend.weblayer.dtos.StudentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentResponse create(@Valid StudentDTO dto) {
        Student student = Student.builder()
                .fullName(dto.getFullName())
                .age(dto.getAge())
                .studentGroup(dto.getStudentGroup())
                .grade(dto.getGrade()) // Only include if present in DTO
                .build();

        Student saved = studentRepository.save(student);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Student> findByFullNameContainingIgnoreCase(String fullName) {
        return studentRepository.findByFullNameContainingIgnoreCase(fullName);
    }

    @Transactional(readOnly = true)
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    @Transactional
    public Student update(@Valid Student student, Long id) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        existing.setFullName(student.getFullName());
        existing.setAge(student.getAge());
        existing.setGrade(student.getGrade());
        existing.setStudentGroup(student.getStudentGroup());

        return studentRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // First delete the associated user
        userRepository.delete(existing.getUser());

        // Then delete the student (progressReports will be removed due to cascade + orphanRemoval)
        studentRepository.delete(existing);
    }


    @Transactional
    public void assignGroup(Long studentId, StudentGroup group) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        student.setStudentGroup(group);  // Assign the new group
        studentRepository.save(student); // Save the updated student entity
    }
    public StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFullName(),
                student.getGrade(),
                student.getStudentGroup(),
                student.getAge(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> searchByName(String name) {
        return studentRepository.findByFullNameContainingIgnoreCase(name);
    }


}
