package com.flowdesk.service;

import com.flowdesk.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for activity logging.
 */
public interface ActivityLogService {
    void log(String action, String description, Long userId, String userName, Long organizationId, Long entityId, String entityType);
    Page<ActivityLog> getLogsByOrganization(Long organizationId, Pageable pageable);
}
