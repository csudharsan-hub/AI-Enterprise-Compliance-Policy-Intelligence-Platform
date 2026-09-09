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
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String userId;
    private String userName;
    private String userRole;

    private String action;       // UPLOADED | ANALYZED | APPROVED | REJECTED | DOWNLOADED | DELETED | LOGIN | REGISTER
    private String resourceType; // REPORT | USER | DOCUMENT
    private String resourceId;
    private String resourceTitle;

    private Map<String, Object> metadata; // extra context

    private String ipAddress;

    @CreatedDate
    private Instant createdAt;
}
