package com.compliance.platform.service.ai;

import com.compliance.platform.model.Clause;
import com.compliance.platform.model.ClassificationResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Complete AI analysis result combining all 4 prompt outputs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResult {

    // From Prompt 1 — Classification
    private ClassificationResult classification;

    // From Prompt 2 — Risk Detection
    private String title;
    private int riskScore;
    private String riskLevel;
    private int complianceScore;
    private String summary;
    private List<Clause> clauses;

    // From Prompt 4 — Executive Summary
    private String executiveHeadline;
    private List<String> keyFindings;
    private List<String> immediateActions;
    private String businessImpact;
    private String recommendedReviewer;

    // Computed stats
    private int totalClauses;
    private int highCount;
    private int mediumCount;
    private int lowCount;
}
