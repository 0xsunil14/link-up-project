package org.link.linkup.dto.response.post;

import lombok.*;
import org.link.linkup.dto.response.user.UserResponse;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    private Integer id;
    private String imageUrl;
    private String caption;
    private UserResponse user;
    private Integer likesCount;
    private Integer commentsCount;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
