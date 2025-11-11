package org.link.linkup.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.link.linkup.dto.request.auth.LoginRequest;
import org.link.linkup.dto.request.auth.RegisterRequest;
import org.link.linkup.dto.request.auth.VerifyOtpRequest;
import org.link.linkup.dto.response.auth.AuthResponse;
import org.link.linkup.dto.response.common.ApiResponse;
import org.link.linkup.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful. Please verify OTP.", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", response));
    }

    @PostMapping("/resend-otp/{userId}")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@PathVariable Integer userId) {
        authService.resendOtp(userId);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session) {
        AuthResponse response = authService.login(request);

        // Store user in session
        session.setAttribute("user", response.getUser());

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}