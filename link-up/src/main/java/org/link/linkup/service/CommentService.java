package org.link.linkup.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.link.linkup.dto.entity.Comment;
import org.link.linkup.dto.entity.Post;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.mapper.CommentMapper;
import org.link.linkup.dto.request.comment.CreateCommentRequest;
import org.link.linkup.dto.response.comment.CommentResponse;
import org.link.linkup.exception.BadRequestException;
import org.link.linkup.exception.NotFoundException;
import org.link.linkup.repository.CommentRepository;
import org.link.linkup.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    /**
     * Get comments for a post
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Integer postId) {
        log.info("Fetching comments for post ID: {}", postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        return post.getComments().stream()
                .map(commentMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Add comment to post
     */
    public CommentResponse addComment(CreateCommentRequest request, User currentUser) {
        log.info("User {} commenting on post {}", currentUser.getUsername(), request.getPostId());

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new NotFoundException("Post not found"));

        // Validate comment content
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        // Create comment with proper post reference
        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(currentUser)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);

        log.info("Comment added successfully to post: {}", request.getPostId());

        return commentMapper.toResponse(savedComment);
    }
}