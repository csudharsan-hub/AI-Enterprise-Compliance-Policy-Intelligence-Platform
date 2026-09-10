package com.compliance.platform.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Clause {
    private String type;
    private String severity;       // High | Medium | Low
    private String originalText;
    private String plainEnglish;
    private String reason;
    private String rewriteSuggestion; // AI-rewritten safe version
}
