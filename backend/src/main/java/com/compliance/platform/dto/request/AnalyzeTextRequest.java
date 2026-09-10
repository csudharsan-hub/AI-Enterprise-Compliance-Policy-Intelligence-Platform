package com.compliance.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AnalyzeTextRequest {

    @NotBlank(message = "Document text is required")
    @Size(min = 50, message = "Text must be at least 50 characters")
    @Size(max = 100000, message = "Text cannot exceed 100,000 characters")
    private String text;

    private String title;
}
