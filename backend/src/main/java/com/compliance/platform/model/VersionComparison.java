package com.compliance.platform.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "version_comparisons")
public class VersionComparison {

    @Id
    private String id;

    private String userId;
    private String reportIdA;
    private String reportIdB;
    private String titleA;
    private String titleB;

    private List<String> addedClauses;
    private List<String> removedClauses;
    private List<String> modifiedClauses;
    private String aiSummary;

    private int riskScoreA;
    private int riskScoreB;
    private int riskDelta; // riskScoreB - riskScoreA

    @CreatedDate
    private Instant createdAt;
}
