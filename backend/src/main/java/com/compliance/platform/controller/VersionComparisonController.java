package com.compliance.platform.controller;

import com.compliance.platform.dto.response.ApiResponse;
import com.compliance.platform.model.VersionComparison;
import com.compliance.platform.service.VersionComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
public class VersionComparisonController {

    private final VersionComparisonService comparisonService;

    /** Compare two reports */
    @PostMapping
    public ResponseEntity<ApiResponse<VersionComparison>> compare(
            @RequestBody Map<String, String> body) {

        String reportIdA = body.get("reportIdA");
        String reportIdB = body.get("reportIdB");

        if (reportIdA == null || reportIdB == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("reportIdA and reportIdB are required."));
        }

        String userId = currentUserId();
        VersionComparison result = comparisonService.compare(reportIdA, reportIdB, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comparison complete.", result));
    }

    /** Get comparison history */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getHistory(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        String userId = currentUserId();
        Page<VersionComparison> history = comparisonService.getHistory(userId, page, size);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "comparisons", history.getContent(),
                "pagination",  Map.of(
                        "total", history.getTotalElements(),
                        "pages", history.getTotalPages(),
                        "page",  history.getNumber()
                )
        )));
    }

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
