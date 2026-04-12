package com.flowdesk.repository;

import com.flowdesk.entity.Project;
import com.flowdesk.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ProjectRepository — Member 2
 * Spring Data JPA repository for Project entities.
 * Phase 2: will add tenant-aware queries.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOrganizationId(Long organizationId);

    List<Project> findByOrganizationIdAndStatus(Long organizationId, ProjectStatus status);
}
