package com.compliance.platform.controller;

import com.compliance.platform.dto.request.AnalyzeTextRequest;
import com.compliance.platform.dto.request.AnalyzeUrlRequest;
import com.compliance.platform.dto.response.ApiResponse;
import com.compliance.platform.model.Report;
import com.compliance.platform.model.User;
import com.compliance.platform.service.*;
import com.compliance.platform.service.ai.AiAnalysisResult;
import com.compliance.platform.service.ai.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyzeController {

    private final AiService aiService;
    private final DocumentExtractionService extractionService;
    private final ReportService reportService;
    private final UserService userService;
    private final AuditService auditService;

    /** Analyze pasted text */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<Report>> analyzeText(
            @Valid @RequestBody AnalyzeTextRequest req) {

        String userId = currentUserId();
        User user = userService.findById(userId);

        log.info("User {} analyzing pasted text ({} chars)", user.getEmail(), req.getText().length());

        AiAnalysisResult result = aiService.runFullAnalysis(req.getText());
        if (req.getTitle() != null && !req.getTitle().isBlank()) result.setTitle(req.getTitle());

        Report report = reportService.saveReport(userId, "paste", null,
                req.getText(), null, result);

        auditService.log(user, "ANALYZED", "REPORT", report.getId(), report.getTitle(),
                Map.of("sourceType", "paste", "riskScore", report.getRiskScore()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document analyzed successfully.", report));
    }

    /** Upload and analyze a file (PDF, DOCX, TXT) */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Report>> analyzeFile(
            @RequestParam("file") MultipartFile file) {

        String userId = currentUserId();
        User user = userService.findById(userId);

        log.info("User {} uploading file: {}", user.getEmail(), file.getOriginalFilename());

        String text = extractionService.extractFromFile(file);
        String ext  = getExtension(file.getOriginalFilename());

        AiAnalysisResult result = aiService.runFullAnalysis(text);

        Report report = reportService.saveReport(userId, ext, null,
                text, file.getOriginalFilename(), result);

        auditService.log(user, "UPLOADED", "REPORT", report.getId(), report.getTitle(),
                Map.of("fileName", file.getOriginalFilename(), "riskScore", report.getRiskScore()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File analyzed successfully.", report));
    }

    /** Fetch URL and analyze its content */
    @PostMapping("/analyze-url")
    public ResponseEntity<ApiResponse<Report>> analyzeUrl(
            @Valid @RequestBody AnalyzeUrlRequest req) {

        String userId = currentUserId();
        User user = userService.findById(userId);

        log.info("User {} analyzing URL: {}", user.getEmail(), req.getUrl());

        DocumentExtractionService.UrlExtractionResult extracted =
                extractionService.extractFromURL(req.getUrl());

        AiAnalysisResult result = aiService.runFullAnalysis(extracted.text());
        if (result.getTitle().equals("Legal Document")) {
            result.setTitle(extracted.pageTitle());
        }

        Report report = reportService.saveReport(userId, "url", req.getUrl(),
                extracted.text(), null, result);

        auditService.log(user, "ANALYZED", "REPORT", report.getId(), report.getTitle(),
                Map.of("sourceType", "url", "url", req.getUrl(), "riskScore", report.getRiskScore()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("URL analyzed successfully.", report));
    }

    /** Get dashboard statistics */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats() {
        String userId = currentUserId();
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardStats(userId)));
    }

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String getExtension(String filename) {
        if (filename == null) return "unknown";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "unknown";
    }
}
