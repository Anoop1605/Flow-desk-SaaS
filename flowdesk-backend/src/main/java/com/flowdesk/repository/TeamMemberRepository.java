package com.flowdesk.repository;

import com.flowdesk.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * TeamMemberRepository — Member 2
 * Spring Data JPA repository for TeamMember entities.
 * Phase 2: will add more complex queries for project-level roles.
 */
@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByProjectId(Long projectId);

    List<TeamMember> findByUserId(Long userId);
}
