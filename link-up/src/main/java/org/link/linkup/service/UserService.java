package org.link.linkup.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.mapper.UserMapper;
import org.link.linkup.dto.request.user.UpdateProfileRequest;
import org.link.linkup.dto.response.user.UserResponse;
import org.link.linkup.exception.BadRequestException;
import org.link.linkup.exception.NotFoundException;
import org.link.linkup.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final UserMapper userMapper;

    /**
     * Get user profile by ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Integer userId, User currentUser) {
        log.info("Fetching profile for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean includeEmail = currentUser.getId().equals(userId);
        return userMapper.toResponse(user, currentUser, includeEmail);
    }

    /**
     * Update user profile
     */
    public UserResponse updateProfile(UpdateProfileRequest request, User currentUser) {
        log.info("Updating profile for user: {}", currentUser.getUsername());

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Update bio if provided
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        // Update image if provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageUrl = fileUploadService.uploadImage(request.getImage());
            user.setImageUrl(imageUrl);
        }

        User savedUser = userRepository.save(user);
        log.info("Profile updated successfully for: {}", savedUser.getUsername());

        return userMapper.toResponse(savedUser, currentUser, true);
    }

    /**
     * Get user suggestions (people to follow)
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getSuggestions(User currentUser) {
        log.info("Fetching suggestions for user: {}", currentUser.getUsername());

        List<User> allVerifiedUsers = userRepository.findByVerifiedTrue();

        // Filter out current user and already following users
        List<User> suggestions = allVerifiedUsers.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> !isFollowing(currentUser, user.getId()))
                .limit(10) // Limit suggestions to 10 users
                .collect(Collectors.toList());

        return suggestions.stream()
                .map(user -> userMapper.toResponse(user, currentUser, false))
                .collect(Collectors.toList());
    }

    /**
     * Follow a user
     */
    public void followUser(Integer targetUserId, User currentUser) {
        log.info("User {} following user {}", currentUser.getUsername(), targetUserId);

        if (currentUser.getId().equals(targetUserId)) {
            throw new BadRequestException("Cannot follow yourself");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Refresh current user to get latest following list
        User refreshedCurrentUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Current user not found"));

        // Check if already following
        if (isFollowing(refreshedCurrentUser, targetUserId)) {
            throw new BadRequestException("Already following this user");
        }

        // Add to following/followers
        refreshedCurrentUser.getFollowing().add(targetUser);
        targetUser.getFollowers().add(refreshedCurrentUser);

        userRepository.save(refreshedCurrentUser);
        userRepository.save(targetUser);

        log.info("User {} now following {}", currentUser.getUsername(), targetUser.getUsername());
    }

    /**
     * Unfollow a user
     */
    public void unfollowUser(Integer targetUserId, User currentUser) {
        log.info("User {} unfollowing user {}", currentUser.getUsername(), targetUserId);

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Refresh current user to get latest following list
        User refreshedCurrentUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Current user not found"));

        // Check if actually following
        if (!isFollowing(refreshedCurrentUser, targetUserId)) {
            throw new BadRequestException("You are not following this user");
        }

        // Remove from following/followers
        refreshedCurrentUser.getFollowing().removeIf(user -> user.getId().equals(targetUserId));
        targetUser.getFollowers().removeIf(user -> user.getId().equals(currentUser.getId()));

        userRepository.save(refreshedCurrentUser);
        userRepository.save(targetUser);

        log.info("User {} unfollowed {}", currentUser.getUsername(), targetUser.getUsername());
    }

    /**
     * Get followers list
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getFollowers(User currentUser) {
        log.info("Fetching followers for user: {}", currentUser.getUsername());

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        return user.getFollowers().stream()
                .map(follower -> userMapper.toResponse(follower, currentUser, false))
                .collect(Collectors.toList());
    }

    /**
     * Get following list
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getFollowing(User currentUser) {
        log.info("Fetching following for user: {}", currentUser.getUsername());

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        return user.getFollowing().stream()
                .map(following -> userMapper.toResponse(following, currentUser, false))
                .collect(Collectors.toList());
    }

    // ========== Private Helper Methods ==========

    private boolean isFollowing(User currentUser, Integer targetUserId) {
        return currentUser.getFollowing().stream()
                .anyMatch(user -> user.getId().equals(targetUserId));
    }
}