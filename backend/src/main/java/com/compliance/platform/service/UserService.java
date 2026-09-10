package com.compliance.platform.service;

import com.compliance.platform.dto.request.RegisterRequest;
import com.compliance.platform.dto.request.UpdateProfileRequest;
import com.compliance.platform.dto.response.UserResponse;
import com.compliance.platform.exception.BusinessException;
import com.compliance.platform.exception.ResourceNotFoundException;
import com.compliance.platform.model.Role;
import com.compliance.platform.model.User;
import com.compliance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().toLowerCase())) {
            throw new BusinessException("An account with this email already exists.", HttpStatus.CONFLICT);
        }

        Role role;
        try {
            role = Role.valueOf(req.getRole().toUpperCase());
        } catch (Exception e) {
            role = Role.EMPLOYEE;
        }

        User user = User.builder()
                .name(req.getName().trim())
                .email(req.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .roles(Set.of(role))
                .department(req.getDepartment())
                .jobTitle(req.getJobTitle())
                .lastLogin(Instant.now())
                .build();

        return userRepository.save(user);
    }

    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateLastLogin(String userId) {
        User user = findById(userId);
        user.setLastLogin(Instant.now());
        return userRepository.save(user);
    }

    public User updateProfile(String userId, UpdateProfileRequest req) {
        User user = findById(userId);

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName().trim());
        }
        if (req.getDepartment() != null) {
            user.setDepartment(req.getDepartment());
        }
        if (req.getJobTitle() != null) {
            user.setJobTitle(req.getJobTitle());
        }

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
                throw new BusinessException("Current password is required to change password");
            }
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                throw new BusinessException("Current password is incorrect", HttpStatus.UNAUTHORIZED);
            }
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        return userRepository.save(user);
    }

    public void incrementDocumentCount(String userId) {
        User user = findById(userId);
        user.setTotalDocuments(user.getTotalDocuments() + 1);
        userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUserRole(String userId, String role) {
        User user = findById(userId);
        Role newRole;
        try {
            newRole = Role.valueOf(role.toUpperCase());
        } catch (Exception e) {
            throw new BusinessException("Invalid role: " + role);
        }
        user.setRoles(Set.of(newRole));
        return toResponse(userRepository.save(user));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .avatar(user.getAvatar())
                .totalDocuments(user.getTotalDocuments())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
