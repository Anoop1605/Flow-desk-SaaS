package com.flowdesk.repository;

import com.flowdesk.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for ActivityLog.
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findByOrganizationId(Long organizationId, Pageable pageable);

    java.util.List<ActivityLog> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    java.util.List<ActivityLog> findByOrganizationIdAndActionInOrderByCreatedAtDesc(Long organizationId,
            java.util.List<String> actions);
}
