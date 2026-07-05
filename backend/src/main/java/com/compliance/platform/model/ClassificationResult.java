package com.compliance.platform.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationResult {
    private String primaryType;       // e.g. "PRIVACY_POLICY"
    private double primaryConfidence; // e.g. 0.97
    private Map<String, Double> allProbabilities;
}
