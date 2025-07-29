package com.sounditout.backend.services;

import com.sounditout.backend.domainLayer.entity.Student;
import com.sounditout.backend.domainLayer.entity.User;
import com.sounditout.backend.domainLayer.enums.Role;
import com.sounditout.backend.repositories.StudentRepository;
import com.sounditout.backend.repositories.UserRepository;
import com.sounditout.backend.security.CustomUserDetails;
import com.sounditout.backend.security.JwtUtil;
import com.sounditout.backend.weblayer.dtos.AuthResponse;
import com.sounditout.backend.weblayer.dtos.LoginRequest;
import com.sounditout.backend.weblayer.dtos.RegisterRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sounditout.backend.domainLayer.enums.StudentGroup;

import static java.lang.System.*;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StudentRepository studentRepository;

    @Transactional
    public AuthResponse register(@Valid RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        // Create and save user with hashed password
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_STUDENT)
                .build();

        userRepository.save(user);

        // Create student profile linked to user (without group yet)
        Student student = Student.builder()
                .fullName(request.getFullName())
                .age(request.getAge())
                .grade(request.getGradeRange())
                .user(user)
                .build();
        student.setStudentGroup(StudentGroup.UNASSIGNED); // or READY, if that makes sense


        studentRepository.save(student);

        out.println("Registering student: " + student.getFullName() + ", Grade: " + student.getGrade());
        out.println("createdAt: " + student.getCreatedAt());
        out.println("updatedAt: " + student.getUpdatedAt());
        out.println("studentGroup: " + student.getStudentGroup());
        out.println("grade: " + student.getGrade());

        try {
            // existing registration logic...
            userRepository.save(user);
            return new AuthResponse(jwtUtil.generateToken(new CustomUserDetails(user)));

        } catch (Exception e) {
            e.printStackTrace(); // 🧠 this is what we need now
            throw e;
        }

    }

    public AuthResponse login(@Valid LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new AuthResponse(jwtUtil.generateToken(new CustomUserDetails(user)));
    }
}
