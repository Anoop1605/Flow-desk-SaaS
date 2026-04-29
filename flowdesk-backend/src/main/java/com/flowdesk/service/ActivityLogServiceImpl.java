package com.flowdesk.service;

import com.flowdesk.entity.ActivityLog;
import com.flowdesk.entity.Organization;
import com.flowdesk.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * ActivityLogServiceImpl
 * Handles persisting activity logs.
 */
@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void log(String action, String description, Long userId, String userName, Long organizationId, Long entityId, String entityType) {
        Organization org = new Organization();
        org.setId(organizationId);

        ActivityLog log = ActivityLog.builder()
                .action(action)
                .description(description)
                .userId(userId)
                .userName(userName)
                .organization(org)
                .entityId(entityId)
                .entityType(entityType)
                .build();

        activityLogRepository.save(log);
    }

    @Override
    public java.util.List<ActivityLog> findAll() {
        return activityLogRepository.findAll();
    }

    @Override
    public Page<ActivityLog> getLogsByOrganization(Long organizationId, Pageable pageable) {
        return activityLogRepository.findByOrganizationId(organizationId, pageable);
    }
}
