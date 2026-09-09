package com.compliance.platform.controller;

import com.compliance.platform.dto.request.LoginRequest;
import com.compliance.platform.dto.request.RegisterRequest;
import com.compliance.platform.dto.request.UpdateProfileRequest;
import com.compliance.platform.dto.response.ApiResponse;
import com.compliance.platform.dto.response.AuthResponse;
import com.compliance.platform.model.User;
import com.compliance.platform.security.JwtUtils;
import com.compliance.platform.service.AuditService;
import com.compliance.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.register(request);
        String token = jwtUtils.generateToken(user.getId());
        auditService.log(user, "REGISTER", "USER", user.getId(), user.getEmail(), null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully.",
                        AuthResponse.builder()
                                .user(userService.toResponse(user))
                                .token(token)
                                .build()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(auth);

        String userId = auth.getName(); // principal is userId
        User user = userService.findById(userId);
        userService.updateLastLogin(userId);

        String token = jwtUtils.generateToken(userId);
        auditService.log(user, "LOGIN", "USER", userId, user.getEmail(), null);

        return ResponseEntity.ok(ApiResponse.success("Login successful.",
                AuthResponse.builder()
                        .user(userService.toResponse(user))
                        .token(token)
                        .build()));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getMe() {
        String userId = getCurrentUserId();
        User user = userService.findById(userId);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("user", userService.toResponse(user))));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Object>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        String userId = getCurrentUserId();
        User updated = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.",
                Map.of("user", userService.toResponse(updated))));
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
