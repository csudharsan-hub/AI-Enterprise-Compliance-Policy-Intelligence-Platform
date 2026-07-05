package com.compliance.platform.controller;

import com.compliance.platform.dto.response.ApiResponse;
import com.compliance.platform.dto.response.UserResponse;
import com.compliance.platform.service.ReportService;
import com.compliance.platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final ReportService reportService;

    /** Get all users */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    /** Update a user's role */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        String role = body.get("role");
        UserResponse updated = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role updated.", updated));
    }

    /** Platform-wide stats */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAdminStats()));
    }
}
