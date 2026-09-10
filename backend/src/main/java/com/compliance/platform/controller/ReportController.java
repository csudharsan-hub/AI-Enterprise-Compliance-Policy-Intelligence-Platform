package com.compliance.platform.controller;

import com.compliance.platform.dto.request.RejectReportRequest;
import com.compliance.platform.dto.response.ApiResponse;
import com.compliance.platform.model.Report;
import com.compliance.platform.model.User;
import com.compliance.platform.service.AuditService;
import com.compliance.platform.service.ReportService;
import com.compliance.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;
    private final AuditService auditService;

    /** Paginated history with filters */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getHistory(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(required = false)      String riskLevel,
            @RequestParam(required = false)      String status,
            @RequestParam(required = false)      String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {

        String userId = currentUserId();
        Page<Report> reports = reportService.getHistory(
                userId, riskLevel, status, search, page, size, sortBy, order);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "reports",    reports.getContent(),
                "pagination", Map.of(
                        "total",   reports.getTotalElements(),
                        "pages",   reports.getTotalPages(),
                        "page",    reports.getNumber(),
                        "size",    reports.getSize(),
                        "hasNext", reports.hasNext(),
                        "hasPrev", reports.hasPrevious()
                )
        )));
    }

    /** Get single report */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Report>> getReport(@PathVariable String id) {
        String userId = currentUserId();
        Report report = reportService.findByIdAndUser(id, userId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /** Delete (soft) */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable String id) {
        String userId = currentUserId();
        User user = userService.findById(userId);
        Report report = reportService.findByIdAndUser(id, userId);

        reportService.softDelete(id, userId);
        auditService.log(user, "DELETED", "REPORT", id, report.getTitle(), null);

        return ResponseEntity.ok(ApiResponse.success("Report deleted successfully.", null));
    }

    /** Approve a report (Legal / Compliance Officer / Admin) */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Report>> approveReport(@PathVariable String id) {
        String userId = currentUserId();
        User user = userService.findById(userId);

        Report report = reportService.approveReport(id, userId);
        auditService.log(user, "APPROVED", "REPORT", id, report.getTitle(), null);

        return ResponseEntity.ok(ApiResponse.success("Report approved.", report));
    }

    /** Reject a report */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Report>> rejectReport(
            @PathVariable String id,
            @Valid @RequestBody RejectReportRequest req) {

        String userId = currentUserId();
        User user = userService.findById(userId);

        Report report = reportService.rejectReport(id, req.getReason());
        auditService.log(user, "REJECTED", "REPORT", id, report.getTitle(),
                Map.of("reason", req.getReason()));

        return ResponseEntity.ok(ApiResponse.success("Report rejected.", report));
    }

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
