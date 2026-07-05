package com.compliance.platform.controller;

import com.compliance.platform.dto.request.UpdateProfileRequest;
import com.compliance.platform.dto.response.ApiResponse;
import com.compliance.platform.model.User;
import com.compliance.platform.service.ReportService;
import com.compliance.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getProfile() {
        String userId = currentUserId();
        User user = userService.findById(userId);
        Map<String, Object> stats = reportService.getDashboardStats(userId);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "user", userService.toResponse(user),
                "stats", stats
        )));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Object>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest req) {
        String userId = currentUserId();
        User updated = userService.updateProfile(userId, req);
        return ResponseEntity.ok(ApiResponse.success("Profile updated.",
                Map.of("user", userService.toResponse(updated))));
    }

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
