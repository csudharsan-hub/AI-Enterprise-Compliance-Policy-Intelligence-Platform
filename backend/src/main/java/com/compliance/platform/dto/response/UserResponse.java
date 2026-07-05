package com.compliance.platform.dto.response;

import com.compliance.platform.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Set<Role> roles;
    private String department;
    private String jobTitle;
    private String avatar;
    private int totalDocuments;
    private Instant lastLogin;
    private Instant createdAt;
}
