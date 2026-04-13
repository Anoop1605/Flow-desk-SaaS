package com.flowdesk.repository;

import com.flowdesk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * User repository for authentication and data access.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByInvitationToken(String invitationToken);

    boolean existsByEmail(String email);

    java.util.List<User> findByOrganizationId(Long organizationId);
}
