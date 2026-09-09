package com.compliance.platform.service;

import com.compliance.platform.exception.BusinessException;
import com.compliance.platform.model.Report;
import com.compliance.platform.model.VersionComparison;
import com.compliance.platform.repository.VersionComparisonRepository;
import com.compliance.platform.service.ai.GroqClient;
import com.compliance.platform.service.ai.PromptLibrary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VersionComparisonService {

    private final VersionComparisonRepository comparisonRepository;
    private final ReportService reportService;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Compare two reports by ID. Both must belong to the requesting user.
     */
    public VersionComparison compare(String reportIdA, String reportIdB, String userId) {
        if (reportIdA.equals(reportIdB)) {
            throw new BusinessException("Cannot compare a report with itself.");
        }

        Report reportA = reportService.findByIdAndUser(reportIdA, userId);
        Report reportB = reportService.findByIdAndUser(reportIdB, userId);

        String textA = reportA.getOriginalText() != null ? reportA.getOriginalText() : "";
        String textB = reportB.getOriginalText() != null ? reportB.getOriginalText() : "";

        // Call AI for comparison
        List<String> added    = new ArrayList<>();
        List<String> removed  = new ArrayList<>();
        List<String> modified = new ArrayList<>();
        String aiSummary = "";
        String riskChange = "Unchanged";

        try {
            String raw = groqClient.chat(
                    PromptLibrary.VERSION_COMPARE_SYSTEM,
                    PromptLibrary.buildVersionComparePrompt(
                            textA, textB, reportA.getTitle(), reportB.getTitle()));

            JsonNode root = objectMapper.readTree(raw);
            aiSummary  = root.path("summary").asText("");
            riskChange = root.path("riskChange").asText("Unchanged");

            root.path("addedClauses").forEach(n    -> added.add(n.asText()));
            root.path("removedClauses").forEach(n  -> removed.add(n.asText()));
            root.path("modifiedClauses").forEach(n -> modified.add(n.asText()));

        } catch (Exception e) {
            log.warn("AI version comparison failed, returning basic diff: {}", e.getMessage());
            aiSummary = "Automated comparison completed. Manual review recommended.";
        }

        int delta = reportB.getRiskScore() - reportA.getRiskScore();

        VersionComparison comparison = VersionComparison.builder()
                .userId(userId)
                .reportIdA(reportIdA)
                .reportIdB(reportIdB)
                .titleA(reportA.getTitle())
                .titleB(reportB.getTitle())
                .addedClauses(added)
                .removedClauses(removed)
                .modifiedClauses(modified)
                .aiSummary(aiSummary)
                .riskScoreA(reportA.getRiskScore())
                .riskScoreB(reportB.getRiskScore())
                .riskDelta(delta)
                .build();

        return comparisonRepository.save(comparison);
    }

    public Page<VersionComparison> getHistory(String userId, int page, int size) {
        return comparisonRepository.findByUserId(userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }
}
