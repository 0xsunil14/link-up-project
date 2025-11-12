package org.link.linkup.dto.request.post;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePostRequest {
    
//    @NotNull(message = "Post ID is required")
    private Integer postId;
    
    @NotBlank(message = "Caption is required")
    @Size(max = 2000, message = "Caption must not exceed 2000 characters")
    private String caption;
}
