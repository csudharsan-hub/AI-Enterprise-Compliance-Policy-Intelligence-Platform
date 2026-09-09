package com.compliance.platform.service;

import com.compliance.platform.model.AuditLog;
import com.compliance.platform.model.User;
import com.compliance.platform.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(User user, String action, String resourceType,
                    String resourceId, String resourceTitle, Map<String, Object> metadata) {

        String roleName = user.getRoles().stream()
                .findFirst()
                .map(Enum::name)
                .orElse("UNKNOWN");

        AuditLog log = AuditLog.builder()
                .userId(user.getId())
                .userName(user.getName())
                .userRole(roleName)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .resourceTitle(resourceTitle)
                .metadata(metadata)
                .build();

        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAll(int page, int size) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Page<AuditLog> getByUser(String userId, int page, int size) {
        return auditLogRepository.findByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Page<AuditLog> getByAction(String action, int page, int size) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action,
                PageRequest.of(page, size));
    }
}
