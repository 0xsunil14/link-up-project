package org.link.linkup.dto.request.comment;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    
    @NotNull(message = "Post ID is required")
    private Integer postId;
    
    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String content;
}