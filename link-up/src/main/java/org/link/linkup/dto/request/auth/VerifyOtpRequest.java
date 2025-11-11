package org.link.linkup.dto.request.auth;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequest {
    
    @NotNull(message = "User ID is required")
    private Integer userId;
    
    @NotNull(message = "OTP is required")
    @Min(value = 1000, message = "Invalid OTP")
    @Max(value = 9999, message = "Invalid OTP")
    private Integer otp;
}
