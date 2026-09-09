package com.compliance.platform.repository;

import com.compliance.platform.model.Report;
import com.compliance.platform.model.RiskLevel;
import com.compliance.platform.model.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {

    Page<Report> findByUserIdAndDeletedFalse(String userId, Pageable pageable);

    Page<Report> findByUserIdAndRiskLevelAndDeletedFalse(String userId, RiskLevel riskLevel, Pageable pageable);

    Page<Report> findByUserIdAndStatusAndDeletedFalse(String userId, DocumentStatus status, Pageable pageable);

    @Query("{ 'userId': ?0, 'deleted': false, 'title': { $regex: ?1, $options: 'i' } }")
    Page<Report> findByUserIdAndTitleContaining(String userId, String title, Pageable pageable);

    List<Report> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(String userId);

    Optional<Report> findByIdAndUserIdAndDeletedFalse(String id, String userId);

    long countByUserIdAndDeletedFalse(String userId);

    long countByUserIdAndRiskLevelAndDeletedFalse(String userId, RiskLevel riskLevel);

    long countByUserIdAndStatusAndDeletedFalse(String userId, DocumentStatus status);

    // Admin queries
    long countByDeletedFalse();
    long countByRiskLevelAndDeletedFalse(RiskLevel riskLevel);
    long countByStatusAndDeletedFalse(DocumentStatus status);

    @Query("{ 'deleted': false, 'createdAt': { $gte: ?0, $lte: ?1 } }")
    List<Report> findAllBetween(Instant from, Instant to);

    List<Report> findByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
}
