package com.sounditout.backend.weblayer.controllers;

import com.sounditout.backend.services.StudentService;
import com.sounditout.backend.weblayer.dtos.StudentDTO;
import com.sounditout.backend.weblayer.dtos.StudentGroupAssignmentDTO;
import com.sounditout.backend.weblayer.dtos.StudentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        return studentService.findById(id)
                .map(studentService::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentService.create(dto));
    }

    @PatchMapping("/{id}/group")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignGroup(@PathVariable Long id,
                                            @Valid @RequestBody StudentGroupAssignmentDTO dto) {
        studentService.assignGroup(id, dto.getStudentGroup());
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents()
                .stream()
                .map(studentService::toResponse)
                .toList());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentResponse>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(studentService.searchByName(name)
                .stream()
                .map(studentService::toResponse)
                .toList());
    }


}
