package com.compliance.platform.service.ai;

import com.compliance.platform.model.Clause;
import com.compliance.platform.model.ClassificationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Risk scoring ─────────────────────────────────────────────────────────
    public int calculateRiskScore(List<Clause> clauses) {
        if (clauses == null || clauses.isEmpty()) return 0;
        int total = clauses.stream().mapToInt(c -> switch (c.getSeverity()) {
            case "High", "Critical" -> 30;
            case "Medium"           -> 20;
            default                 -> 10;
        }).sum();
        return Math.min(100, total);
    }

    public String getRiskLevel(int score) {
        if (score <= 20) return "SAFE";
        if (score <= 50) return "MEDIUM";
        if (score <= 80) return "HIGH";
        return "CRITICAL";
    }

    public int calculateComplianceScore(int riskScore) {
        return Math.max(0, 100 - riskScore);
    }

    // ── Prompt 1: Document Classification ────────────────────────────────────
    public ClassificationResult classifyDocument(String text) {
        try {
            String raw = groqClient.chat(
                    PromptLibrary.CLASSIFICATION_SYSTEM,
                    PromptLibrary.buildClassificationPrompt(text));
            JsonNode root = objectMapper.readTree(raw);

            Map<String, Double> probs = new LinkedHashMap<>();
            JsonNode probsNode = root.path("allProbabilities");
            probsNode.fields().forEachRemaining(e -> probs.put(e.getKey(), e.getValue().asDouble()));

            return ClassificationResult.builder()
                    .primaryType(root.path("primaryType").asText("OTHER"))
                    .primaryConfidence(root.path("primaryConfidence").asDouble(0.5))
                    .allProbabilities(probs)
                    .build();
        } catch (Exception e) {
            log.warn("Classification failed, defaulting: {}", e.getMessage());
            return ClassificationResult.builder()
                    .primaryType("OTHER")
                    .primaryConfidence(0.5)
                    .allProbabilities(Map.of("OTHER", 1.0))
                    .build();
        }
    }

    // ── Prompt 2: Risk Detection ──────────────────────────────────────────────
    public AiAnalysisResult analyzeRisk(String text) {
        String raw = groqClient.chat(
                PromptLibrary.RISK_DETECTION_SYSTEM,
                PromptLibrary.buildRiskDetectionPrompt(text));
        try {
            JsonNode root = objectMapper.readTree(raw);
            List<Clause> clauses = new ArrayList<>();
            JsonNode clausesNode = root.path("clauses");
            if (clausesNode.isArray()) {
                for (JsonNode cn : clausesNode) {
                    clauses.add(Clause.builder()
                            .type(cn.path("type").asText("Other"))
                            .severity(cn.path("severity").asText("Low"))
                            .originalText(cn.path("originalText").asText(""))
                            .plainEnglish(cn.path("plainEnglish").asText(""))
                            .reason(cn.path("reason").asText(""))
                            .build());
                }
            }

            int riskScore = calculateRiskScore(clauses);
            String riskLevel = getRiskLevel(riskScore);
            int complianceScore = calculateComplianceScore(riskScore);
            int high   = (int) clauses.stream().filter(c -> c.getSeverity().equals("High") || c.getSeverity().equals("Critical")).count();
            int medium = (int) clauses.stream().filter(c -> c.getSeverity().equals("Medium")).count();
            int low    = (int) clauses.stream().filter(c -> c.getSeverity().equals("Low")).count();

            return AiAnalysisResult.builder()
                    .title(root.path("title").asText("Legal Document"))
                    .riskScore(riskScore)
                    .riskLevel(riskLevel)
                    .complianceScore(complianceScore)
                    .summary(root.path("summary").asText(""))
                    .clauses(clauses)
                    .totalClauses(clauses.size())
                    .highCount(high)
                    .mediumCount(medium)
                    .lowCount(low)
                    .build();
        } catch (Exception e) {
            log.error("Risk analysis parse error: {}", e.getMessage(), e);
            throw new RuntimeException("AI risk analysis failed: " + e.getMessage(), e);
        }
    }

    // ── Prompt 3: Rewrite Suggestions ────────────────────────────────────────
    public List<Clause> addRewriteSuggestions(List<Clause> clauses) {
        if (clauses == null || clauses.isEmpty()) return clauses;
        List<String> targets = clauses.stream()
                .filter(c -> c.getSeverity().equals("High") || c.getSeverity().equals("Medium"))
                .map(Clause::getOriginalText)
                .filter(t -> t != null && !t.isBlank())
                .limit(10)
                .toList();

        if (targets.isEmpty()) return clauses;

        try {
            String raw = groqClient.chat(
                    PromptLibrary.REWRITE_SYSTEM,
                    PromptLibrary.buildRewritePrompt(targets));
            JsonNode root = objectMapper.readTree(raw);
            Map<String, String> rewriteMap = new HashMap<>();
            root.path("rewrites").forEach(rw -> {
                String orig      = rw.path("originalText").asText("").trim();
                String rewritten = rw.path("rewrittenText").asText("").trim();
                if (!orig.isBlank() && !rewritten.isBlank()) rewriteMap.put(orig, rewritten);
            });
            clauses.forEach(c -> {
                if (c.getOriginalText() != null) {
                    String suggestion = rewriteMap.get(c.getOriginalText().trim());
                    if (suggestion != null) c.setRewriteSuggestion(suggestion);
                }
            });
        } catch (Exception e) {
            log.warn("Rewrite suggestions failed (non-critical): {}", e.getMessage());
        }
        return clauses;
    }

    // ── Prompt 4: Executive Summary ───────────────────────────────────────────
    public void enrichWithExecutiveSummary(AiAnalysisResult result) {
        try {
            List<String> clauseTypes = result.getClauses().stream()
                    .map(Clause::getType).distinct().limit(10).toList();

            String raw = groqClient.chat(
                    PromptLibrary.EXECUTIVE_SUMMARY_SYSTEM,
                    PromptLibrary.buildExecutiveSummaryPrompt(
                            result.getTitle(), result.getRiskLevel(),
                            result.getRiskScore(), clauseTypes));

            JsonNode root = objectMapper.readTree(raw);
            result.setExecutiveHeadline(root.path("headline").asText(""));
            result.setBusinessImpact(root.path("businessImpact").asText(""));
            result.setRecommendedReviewer(root.path("recommendedReviewer").asText("Legal Team"));

            List<String> findings = new ArrayList<>();
            root.path("keyFindings").forEach(n -> findings.add(n.asText()));
            result.setKeyFindings(findings);

            List<String> actions = new ArrayList<>();
            root.path("immediateActions").forEach(n -> actions.add(n.asText()));
            result.setImmediateActions(actions);
        } catch (Exception e) {
            log.warn("Executive summary failed (non-critical): {}", e.getMessage());
        }
    }

    // ── Full pipeline ─────────────────────────────────────────────────────────
    public AiAnalysisResult runFullAnalysis(String text) {
        // Step 1: Classify document type
        ClassificationResult classification = classifyDocument(text);

        // Step 2: Detect risky clauses
        AiAnalysisResult result = analyzeRisk(text);
        result.setClassification(classification);

        // Step 3: Rewrite suggestions for dangerous clauses
        result.setClauses(addRewriteSuggestions(result.getClauses()));

        // Step 4: Executive summary for management
        enrichWithExecutiveSummary(result);

        return result;
    }
}
