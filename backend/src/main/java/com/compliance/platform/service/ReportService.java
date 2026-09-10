package com.compliance.platform.service;

import com.compliance.platform.exception.ResourceNotFoundException;
import com.compliance.platform.model.*;
import com.compliance.platform.repository.ReportRepository;
import com.compliance.platform.service.ai.AiAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserService userService;

    /**
     * Persist an AI analysis result as a Report document.
     */
    public Report saveReport(String userId, String sourceType, String sourceUrl,
                             String originalText, String fileName,
                             AiAnalysisResult ai) {

        RiskLevel riskLevel;
        try {
            riskLevel = RiskLevel.valueOf(ai.getRiskLevel());
        } catch (Exception e) {
            riskLevel = RiskLevel.SAFE;
        }

        ClassificationResult cls = ai.getClassification();

        Report report = Report.builder()
                .userId(userId)
                .title(ai.getTitle())
                .documentType(cls != null ? cls.getPrimaryType() : "OTHER")
                .classificationConfidence(cls != null ? cls.getPrimaryConfidence() : 0.5)
                .classificationProbabilities(cls != null ? cls.getAllProbabilities() : null)
                .sourceType(sourceType)
                .sourceUrl(sourceUrl)
                .originalText(originalText.length() > 50000
                        ? originalText.substring(0, 50000) : originalText)
                .fileName(fileName)
                .riskScore(ai.getRiskScore())
                .riskLevel(riskLevel)
                .complianceScore(ai.getComplianceScore())
                .summary(ai.getSummary())
                .clauses(ai.getClauses() != null ? ai.getClauses() : new ArrayList<>())
                .totalClauses(ai.getTotalClauses())
                .highCount(ai.getHighCount())
                .mediumCount(ai.getMediumCount())
                .lowCount(ai.getLowCount())
                // Executive summary fields from Prompt 4
                .executiveHeadline(ai.getExecutiveHeadline())
                .keyFindings(ai.getKeyFindings())
                .immediateActions(ai.getImmediateActions())
                .businessImpact(ai.getBusinessImpact())
                .recommendedReviewer(ai.getRecommendedReviewer())
                .status(DocumentStatus.PENDING_REVIEW)
                .version(1)
                .build();

        Report saved = reportRepository.save(report);
        userService.incrementDocumentCount(userId);
        return saved;
    }

    public Report findByIdAndUser(String id, String userId) {
        return reportRepository.findByIdAndUserIdAndDeletedFalse(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    public Report findById(String id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    public Page<Report> getHistory(String userId, String riskLevel, String status,
                                   String search, int page, int size, String sortBy, String order) {
        Sort sort = order.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (search != null && !search.isBlank()) {
            return reportRepository.findByUserIdAndTitleContaining(userId, search, pageable);
        }
        if (riskLevel != null && !riskLevel.isBlank()) {
            try {
                return reportRepository.findByUserIdAndRiskLevelAndDeletedFalse(
                        userId, RiskLevel.valueOf(riskLevel.toUpperCase()), pageable);
            } catch (Exception ignored) {}
        }
        if (status != null && !status.isBlank()) {
            try {
                return reportRepository.findByUserIdAndStatusAndDeletedFalse(
                        userId, DocumentStatus.valueOf(status.toUpperCase()), pageable);
            } catch (Exception ignored) {}
        }
        return reportRepository.findByUserIdAndDeletedFalse(userId, pageable);
    }

    public void softDelete(String id, String userId) {
        Report report = findByIdAndUser(id, userId);
        report.setDeleted(true);
        reportRepository.save(report);
    }

    public Report approveReport(String id, String approverId) {
        Report report = findById(id);
        report.setStatus(DocumentStatus.APPROVED);
        report.setApprovedBy(approverId);
        report.setApprovedAt(Instant.now());
        return reportRepository.save(report);
    }

    public Report rejectReport(String id, String reason) {
        Report report = findById(id);
        report.setStatus(DocumentStatus.REJECTED);
        report.setRejectionReason(reason);
        return reportRepository.save(report);
    }

    // Dashboard stats
    public Map<String, Object> getDashboardStats(String userId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalDocuments",   reportRepository.countByUserIdAndDeletedFalse(userId));
        stats.put("safeCount",        reportRepository.countByUserIdAndRiskLevelAndDeletedFalse(userId, RiskLevel.SAFE));
        stats.put("mediumCount",      reportRepository.countByUserIdAndRiskLevelAndDeletedFalse(userId, RiskLevel.MEDIUM));
        stats.put("highCount",        reportRepository.countByUserIdAndRiskLevelAndDeletedFalse(userId, RiskLevel.HIGH));
        stats.put("criticalCount",    reportRepository.countByUserIdAndRiskLevelAndDeletedFalse(userId, RiskLevel.CRITICAL));
        stats.put("pendingReview",    reportRepository.countByUserIdAndStatusAndDeletedFalse(userId, DocumentStatus.PENDING_REVIEW));
        stats.put("approved",         reportRepository.countByUserIdAndStatusAndDeletedFalse(userId, DocumentStatus.APPROVED));

        // Recent 5 reports
        Pageable recent = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        List<Report> recentReports = reportRepository
                .findByUserIdAndDeletedFalse(userId, recent).getContent();
        stats.put("recentReports", recentReports);

        return stats;
    }

    // Admin global stats
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalDocuments", reportRepository.countByDeletedFalse());
        stats.put("criticalCount",  reportRepository.countByRiskLevelAndDeletedFalse(RiskLevel.CRITICAL));
        stats.put("highCount",      reportRepository.countByRiskLevelAndDeletedFalse(RiskLevel.HIGH));
        stats.put("pendingReview",  reportRepository.countByStatusAndDeletedFalse(DocumentStatus.PENDING_REVIEW));
        stats.put("approved",       reportRepository.countByStatusAndDeletedFalse(DocumentStatus.APPROVED));

        Pageable recent = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        stats.put("recentReports",  reportRepository.findByDeletedFalseOrderByCreatedAtDesc(recent));
        return stats;
    }
}
