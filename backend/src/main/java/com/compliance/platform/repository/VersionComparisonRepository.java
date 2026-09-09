package com.compliance.platform.repository;

import com.compliance.platform.model.VersionComparison;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VersionComparisonRepository extends MongoRepository<VersionComparison, String> {
    Page<VersionComparison> findByUserId(String userId, Pageable pageable);
    List<VersionComparison> findByUserIdOrderByCreatedAtDesc(String userId);
}
