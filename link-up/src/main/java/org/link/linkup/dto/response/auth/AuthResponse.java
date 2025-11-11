package org.link.linkup.dto.response.auth;

import lombok.*;
import org.link.linkup.dto.response.user.UserResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;

    @Builder.Default
    private String type = "Bearer";

    private UserResponse user;
}