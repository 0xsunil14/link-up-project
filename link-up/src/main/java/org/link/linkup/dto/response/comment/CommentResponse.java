package org.link.linkup.dto.response.comment;

import lombok.*;
import org.link.linkup.dto.response.user.UserResponse;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Integer id;
    private String content;
    private UserResponse user;
    private LocalDateTime createdAt;
}