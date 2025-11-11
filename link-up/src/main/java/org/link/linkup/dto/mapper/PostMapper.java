package org.link.linkup.dto.mapper;

import org.link.linkup.dto.entity.Post;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.response.post.PostResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {
    
    @Autowired
    private UserMapper userMapper;
    
    public PostResponse toResponse(Post post, User currentUser) {
        if (post == null) return null;
        
        boolean isLiked = false;
        if (currentUser != null && post.getLikedUsers() != null) {
            isLiked = post.getLikedUsers().stream()
                    .anyMatch(u -> u.getId().equals(currentUser.getId()));
        }
        
        return PostResponse.builder()
                .id(post.getId())
                .imageUrl(post.getImageUrl())
                .caption(post.getCaption())
                .user(userMapper.toResponse(post.getUser()))
                .likesCount(post.getLikedUsers() != null ? post.getLikedUsers().size() : 0)
                .commentsCount(post.getComments() != null ? post.getComments().size() : 0)
                .isLiked(isLiked)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}