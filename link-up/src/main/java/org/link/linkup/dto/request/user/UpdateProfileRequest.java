package org.link.linkup.dto.request.user;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    
    private MultipartFile image;
}