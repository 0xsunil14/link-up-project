package org.link.linkup.dto.request.post;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {
    
    @NotBlank(message = "Caption is required")
    @Size(max = 2000, message = "Caption must not exceed 2000 characters")
    private String caption;
    
    private MultipartFile image;
}