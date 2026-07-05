package com.compliance.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectReportRequest {
    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
