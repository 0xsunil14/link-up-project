package org.link.linkup.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.request.post.CreatePostRequest;
import org.link.linkup.dto.request.post.UpdatePostRequest;
import org.link.linkup.dto.response.common.ApiResponse;
import org.link.linkup.dto.response.post.PostResponse;
import org.link.linkup.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * Get home feed (all posts from following users)
     * GET /api/posts/feed
     */
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFeed(User currentUser) {
        List<PostResponse> posts = postService.getHomeFeed(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Feed fetched successfully", posts));
    }

    /**
     * Get single post by ID
     * GET /api/posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @PathVariable Integer id,
            User currentUser) {
        PostResponse post = postService.getPostById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Post fetched successfully", post));
    }

    /**
     * Get user's posts
     * GET /api/posts/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getUserPosts(
            @PathVariable Integer userId,
            User currentUser) {
        List<PostResponse> posts = postService.getUserPosts(userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("User posts fetched successfully", posts));
    }

    /**
     * Create new post
     * POST /api/posts
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @ModelAttribute CreatePostRequest request,
            User currentUser) {
        PostResponse response = postService.createPost(request, currentUser);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Post created successfully", response));
    }

    /**
     * Update post
     * PUT /api/posts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Integer id,
            @Valid @RequestBody UpdatePostRequest request,
            User currentUser) {
        request.setPostId(id);
        PostResponse response = postService.updatePost(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Post updated successfully", response));
    }

    /**
     * Delete post
     * DELETE /api/posts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Integer id,
            User currentUser) {
        postService.deletePost(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }

    /**
     * Like a post
     * POST /api/posts/{id}/like
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<PostResponse>> likePost(
            @PathVariable Integer id,
            User currentUser) {
        PostResponse response = postService.likePost(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Post liked successfully", response));
    }

    /**
     * Unlike a post
     * DELETE /api/posts/{id}/like
     */
    @DeleteMapping("/{id}/like")
    public ResponseEntity<ApiResponse<PostResponse>> unlikePost(
            @PathVariable Integer id,
            User currentUser) {
        PostResponse response = postService.unlikePost(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Post unliked successfully", response));
    }
}