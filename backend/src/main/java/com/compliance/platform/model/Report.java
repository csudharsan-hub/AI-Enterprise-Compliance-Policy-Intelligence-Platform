package com.compliance.platform.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reports")
public class Report {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    // AI Classification
    private String documentType;          // AI-classified type
    private double classificationConfidence;
    private Map<String, Double> classificationProbabilities;

    // Source
    private String sourceType;            // paste | pdf | docx | txt | url
    private String sourceUrl;
    private String originalText;
    private String fileName;

    // AI Analysis results
    private int riskScore;                // 0-100
    private RiskLevel riskLevel;          // SAFE | MEDIUM | HIGH | CRITICAL
    private int complianceScore;          // 0-100 (inverse of risk + adjustments)
    private String summary;               // Executive summary

    @Builder.Default
    private List<Clause> clauses = new ArrayList<>();

    // Clause counts
    private int totalClauses;
    private int highCount;
    private int mediumCount;
    private int lowCount;

    // Executive summary (from Prompt 4)
    private String executiveHeadline;
    private List<String> keyFindings;
    private List<String> immediateActions;
    private String businessImpact;
    private String recommendedReviewer;

    // Approval workflow
    @Builder.Default
    private DocumentStatus status = DocumentStatus.PENDING_REVIEW;
    private String approvedBy;
    private Instant approvedAt;
    private String rejectionReason;

    // Version tracking
    private String parentReportId;        // For version comparison
    private int version;

    // Soft delete
    @Builder.Default
    private boolean deleted = false;

    @CreatedDate
    private Instant createdAt;
}
