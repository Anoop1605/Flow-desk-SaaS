package com.flowdesk.service;

import com.flowdesk.dto.CommentCreateRequest;
import com.flowdesk.dto.CommentResponse;

import java.util.List;

/**
 * Service interface for Comment operations.
 * Phase 1: empty implementation.
 * Phase 2: fully implemented with JPA persistence.
 */
public interface CommentService {

    CommentResponse addComment(Long taskId, Long authorId, CommentCreateRequest request);

    List<CommentResponse> getCommentsByTaskId(Long taskId);

    CommentResponse updateComment(Long commentId, Long authorId, CommentCreateRequest request);

    void deleteComment(Long commentId, Long userId);
}
