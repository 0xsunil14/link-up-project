package org.link.linkup.controller;

import lombok.RequiredArgsConstructor;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.request.user.UpdateProfileRequest;
import org.link.linkup.dto.response.common.ApiResponse;
import org.link.linkup.dto.response.user.UserResponse;
import org.link.linkup.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(User currentUser) {
        UserResponse response = userService.getUserProfile(currentUser.getId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(
            @PathVariable Integer userId,
            User currentUser) {
        UserResponse response = userService.getUserProfile(userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @ModelAttribute UpdateProfileRequest request,
            User currentUser) {
        UserResponse response = userService.updateProfile(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getSuggestions(User currentUser) {
        List<UserResponse> suggestions = userService.getSuggestions(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Suggestions fetched successfully", suggestions));
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse<Void>> followUser(
            @PathVariable Integer userId,
            User currentUser) {
        userService.followUser(userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("User followed successfully", null));
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(
            @PathVariable Integer userId,
            User currentUser) {
        userService.unfollowUser(userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("User unfollowed successfully", null));
    }

    @GetMapping("/followers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFollowers(User currentUser) {
        List<UserResponse> followers = userService.getFollowers(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Followers fetched successfully", followers));
    }

    @GetMapping("/following")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFollowing(User currentUser) {
        List<UserResponse> following = userService.getFollowing(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Following list fetched successfully", following));
    }
}