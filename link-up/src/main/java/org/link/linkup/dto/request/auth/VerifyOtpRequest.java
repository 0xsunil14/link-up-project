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
    @Min(value = 100000, message = "Invalid OTP")
    @Max(value = 999999, message = "Invalid OTP")
    private Integer otp;
}
