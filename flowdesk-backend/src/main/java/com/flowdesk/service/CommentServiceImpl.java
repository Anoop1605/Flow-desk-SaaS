package com.flowdesk.service;

import com.flowdesk.dto.CommentCreateRequest;
import com.flowdesk.dto.CommentResponse;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Phase 1: Empty / stub implementation of CommentService.
 * All methods return null or empty collections.
 * Will be fully implemented in Phase 2.
 */
@Service
public class CommentServiceImpl implements CommentService {

    @Override
    public CommentResponse addComment(Long taskId, Long authorId, CommentCreateRequest request) {
        // TODO: Phase 2 — persist to database
        return null;
    }

    @Override
    public List<CommentResponse> getCommentsByTaskId(Long taskId) {
        // TODO: Phase 2 — fetch from database ordered by createdAt
        return Collections.emptyList();
    }

    @Override
    public CommentResponse updateComment(Long commentId, Long authorId, CommentCreateRequest request) {
        // TODO: Phase 2 — update comment content
        return null;
    }

    @Override
    public void deleteComment(Long commentId, Long userId) {
        // TODO: Phase 2 — delete with permission check (owner or ADMIN)
    }
}
