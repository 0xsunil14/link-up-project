package org.link.linkup.dto.mapper;

import org.link.linkup.dto.entity.Comment;
import org.link.linkup.dto.response.comment.CommentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {
    
    @Autowired
    private UserMapper userMapper;
    
    public CommentResponse toResponse(Comment comment) {
        if (comment == null) return null;
        
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(userMapper.toResponse(comment.getUser()))
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
