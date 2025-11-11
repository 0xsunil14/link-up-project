package org.link.linkup.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.request.comment.CreateCommentRequest;
import org.link.linkup.dto.response.comment.CommentResponse;
import org.link.linkup.dto.response.common.ApiResponse;
import org.link.linkup.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * Get comments for a post
     * GET /api/posts/{postId}/comments
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Integer postId) {
        List<CommentResponse> comments = commentService.getComments(postId);
        return ResponseEntity.ok(ApiResponse.success("Comments fetched successfully", comments));
    }

    /**
     * Add comment to a post
     * POST /api/posts/{postId}/comments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Integer postId,
            @Valid @RequestBody CreateCommentRequest request,
            User currentUser) {
        request.setPostId(postId);
        CommentResponse response = commentService.addComment(request, currentUser);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", response));
    }
}