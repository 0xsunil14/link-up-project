package org.link.linkup.dto.mapper;

import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.response.user.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    public UserResponse toResponse(User user) {
        return toResponse(user, null, false);
    }
    
    public UserResponse toResponse(User user, User currentUser, boolean includeEmail) {
        if (user == null) return null;
        
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .username(user.getUsername())
                .bio(user.getBio())
                .imageUrl(user.getImageUrl())
                .prime(user.getPrime())
                .verified(user.getVerified())
                .followersCount(user.getFollowers() != null ? user.getFollowers().size() : 0)
                .followingCount(user.getFollowing() != null ? user.getFollowing().size() : 0)
                .build();
        
        if (includeEmail) {
            response.setEmail(user.getEmail());
        }
        
        if (currentUser != null) {
            boolean isFollowing = currentUser.getFollowing().stream()
                    .anyMatch(u -> u.getId().equals(user.getId()));
            boolean isFollower = currentUser.getFollowers().stream()
                    .anyMatch(u -> u.getId().equals(user.getId()));
            response.setIsFollowing(isFollowing);
            response.setIsFollower(isFollower);
        }
        
        return response;
    }
}