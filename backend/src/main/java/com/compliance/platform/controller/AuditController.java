package com.compliance.platform.controller;

import com.compliance.platform.dto.response.ApiResponse;
import com.compliance.platform.model.AuditLog;
import com.compliance.platform.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    /** All audit logs — Admin + Compliance Officer only (secured in SecurityConfig) */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    String action) {

        Page<AuditLog> logs = action != null && !action.isBlank()
                ? auditService.getByAction(action, page, size)
                : auditService.getAll(page, size);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "logs", logs.getContent(),
                "pagination", Map.of(
                        "total", logs.getTotalElements(),
                        "pages", logs.getTotalPages(),
                        "page",  logs.getNumber(),
                        "size",  logs.getSize()
                )
        )));
    }

    /** My own audit logs */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Object>> getMyLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Page<AuditLog> logs = auditService.getByUser(userId, page, size);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "logs", logs.getContent(),
                "pagination", Map.of(
                        "total", logs.getTotalElements(),
                        "pages", logs.getTotalPages(),
                        "page",  logs.getNumber()
                )
        )));
    }
}
