package org.link.linkup.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.link.linkup.dto.entity.Post;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.mapper.PostMapper;
import org.link.linkup.dto.request.post.CreatePostRequest;
import org.link.linkup.dto.request.post.UpdatePostRequest;
import org.link.linkup.dto.response.post.PostResponse;
import org.link.linkup.exception.BadRequestException;
import org.link.linkup.exception.NotFoundException;
import org.link.linkup.exception.UnauthorizedException;
import org.link.linkup.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final FileUploadService fileUploadService;
    private final PostMapper postMapper;

    /**
     * Get home feed (posts from following users + own posts)
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getHomeFeed(User currentUser) {
        log.info("Fetching feed for user: {}", currentUser.getUsername());

        // Get list of users to show posts from (following + self)
        List<User> usersToShow = new ArrayList<>(currentUser.getFollowing());
        usersToShow.add(currentUser);

        List<Post> posts;
        if (usersToShow.isEmpty()) {
            posts = new ArrayList<>();
        } else {
            posts = postRepository.findByUserInOrderByCreatedAtDesc(usersToShow);
        }

        return posts.stream()
                .map(post -> postMapper.toResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    /**
     * Get user's posts
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getUserPosts(Integer userId, User currentUser) {
        log.info("Fetching posts for user ID: {}", userId);

        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return posts.stream()
                .map(post -> postMapper.toResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    /**
     * Get post by ID
     */
    @Transactional(readOnly = true)
    public PostResponse getPostById(Integer postId, User currentUser) {
        log.info("Fetching post ID: {}", postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        return postMapper.toResponse(post, currentUser);
    }

    /**
     * Create new post
     */
    public PostResponse createPost(CreatePostRequest request, User currentUser) {
        log.info("Creating new post for user: {}", currentUser.getUsername());

        // Validate that at least caption or image is provided
        if ((request.getCaption() == null || request.getCaption().trim().isEmpty()) &&
                (request.getImage() == null || request.getImage().isEmpty())) {
            throw new BadRequestException("Post must have either a caption or an image");
        }

        // Upload image if provided
        String imageUrl = null;
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageUrl = fileUploadService.uploadImage(request.getImage());
        }

        Post post = Post.builder()
                .caption(request.getCaption())
                .imageUrl(imageUrl)
                .user(currentUser)
                .build();

        Post savedPost = postRepository.save(post);
        log.info("Post created successfully with ID: {}", savedPost.getId());

        return postMapper.toResponse(savedPost, currentUser);
    }

    /**
     * Update post
     */
    public PostResponse updatePost(UpdatePostRequest request, User currentUser) {
        log.info("Updating post ID: {}", request.getPostId());

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new NotFoundException("Post not found"));

        // Check ownership
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own posts");
        }

        // Validate caption
        if (request.getCaption() == null || request.getCaption().trim().isEmpty()) {
            throw new BadRequestException("Caption cannot be empty");
        }

        post.setCaption(request.getCaption());

        Post savedPost = postRepository.save(post);
        log.info("Post updated successfully: {}", savedPost.getId());

        return postMapper.toResponse(savedPost, currentUser);
    }

    /**
     * Delete post
     */
    public void deletePost(Integer postId, User currentUser) {
        log.info("Deleting post ID: {}", postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        // Check ownership
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        postRepository.delete(post);
        log.info("Post deleted successfully: {}", postId);
    }

    /**
     * Like a post
     */
    public PostResponse likePost(Integer postId, User currentUser) {
        log.info("User {} liking post {}", currentUser.getUsername(), postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        // Check if already liked
        boolean alreadyLiked = post.getLikedUsers().stream()
                .anyMatch(user -> user.getId().equals(currentUser.getId()));

        if (alreadyLiked) {
            throw new BadRequestException("Post already liked");
        }

        post.getLikedUsers().add(currentUser);
        Post savedPost = postRepository.save(post);

        log.info("Post {} liked by user {}", postId, currentUser.getUsername());

        return postMapper.toResponse(savedPost, currentUser);
    }

    /**
     * Unlike a post
     */
    public PostResponse unlikePost(Integer postId, User currentUser) {
        log.info("User {} unliking post {}", currentUser.getUsername(), postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        boolean wasLiked = post.getLikedUsers().removeIf(user -> user.getId().equals(currentUser.getId()));

        if (!wasLiked) {
            throw new BadRequestException("Post was not liked");
        }

        Post savedPost = postRepository.save(post);

        log.info("Post {} unliked by user {}", postId, currentUser.getUsername());

        return postMapper.toResponse(savedPost, currentUser);
    }
}