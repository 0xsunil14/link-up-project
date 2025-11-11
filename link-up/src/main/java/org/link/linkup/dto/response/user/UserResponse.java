package org.link.linkup.dto.response.user;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private Integer id;
    private String firstname;
    private String lastname;
    private String username;
    private String email;
    private String bio;
    private String imageUrl;
    private Boolean prime;
    private Boolean verified;
    private Integer followersCount;
    private Integer followingCount;
    private Boolean isFollowing;
    private Boolean isFollower;
}