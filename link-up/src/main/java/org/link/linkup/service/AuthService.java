package org.link.linkup.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.mapper.UserMapper;
import org.link.linkup.dto.request.auth.LoginRequest;
import org.link.linkup.dto.request.auth.RegisterRequest;
import org.link.linkup.dto.request.auth.VerifyOtpRequest;
import org.link.linkup.dto.response.auth.AuthResponse;
import org.link.linkup.dto.response.user.UserResponse;
import org.link.linkup.exception.BadRequestException;
import org.link.linkup.exception.UnauthorizedException;
import org.link.linkup.repository.UserRepository;
import org.link.linkup.util.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Register new user
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Validate password strength
        validatePasswordStrength(request.getPassword());

        // Check if user already exists
        validateUserDoesNotExist(request);

        // Create user entity
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .username(request.getUsername())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .gender(request.getGender())
                .verified(false)
                .prime(false)
                .build();

        // Generate and send OTP
        int otp = generateOtp();
        user.setOtp(otp);

        User savedUser = userRepository.save(user);

        // Send OTP email
        try {
            emailService.sendOtp(savedUser.getEmail(), otp, savedUser.getFirstname());
            log.info("OTP sent successfully to: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("Failed to send OTP email", e);
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }

        log.info("User registered successfully: {}", savedUser.getUsername());

        // Return response with user ID for OTP verification
        UserResponse userResponse = userMapper.toResponse(savedUser, null, false);
        return AuthResponse.builder()
                .user(userResponse)
                .build();
    }

    /**
     * Verify OTP
     */
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        log.info("Verifying OTP for user ID: {}", request.getUserId());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Check if OTP is null
        if (user.getOtp() == null) {
            throw new BadRequestException("No OTP found. Please request a new OTP.");
        }

        // Verify OTP
        if (!user.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP. Please check and try again.");
        }

        // Mark user as verified and clear OTP
        user.setVerified(true);
        user.setOtp(null);
        User savedUser = userRepository.save(user);

        log.info("User verified successfully: {}", savedUser.getUsername());

        UserResponse userResponse = userMapper.toResponse(savedUser, null, true);
        return AuthResponse.builder()
                .user(userResponse)
                .build();
    }

    /**
     * Resend OTP - Fixed version
     */
    public void resendOtp(Integer userId) {
        log.info("Resending OTP for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Check if user is already verified
        if (user.getVerified()) {
            throw new BadRequestException("User is already verified");
        }

        // Generate NEW OTP
        int newOtp = generateOtp();

        // IMPORTANT: Clear old OTP and set new one
        user.setOtp(newOtp);

        // Save to database FIRST
        User savedUser = userRepository.save(user);

        // Then send email with the new OTP
        try {
            emailService.sendOtp(savedUser.getEmail(), newOtp, savedUser.getFirstname());
            log.info("New OTP generated and sent successfully to: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("Failed to send OTP email", e);
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // Check if verified
        if (!user.getVerified()) {
            // Generate and send new OTP
            int otp = generateOtp();
            user.setOtp(otp);
            userRepository.save(user);

            try {
                emailService.sendOtp(user.getEmail(), otp, user.getFirstname());
            } catch (Exception e) {
                log.error("Failed to send OTP", e);
            }

            throw new BadRequestException("Email not verified. A new OTP has been sent to your email.");
        }

        log.info("User logged in successfully: {}", user.getUsername());

        UserResponse userResponse = userMapper.toResponse(user, null, true);
        return AuthResponse.builder()
                .user(userResponse)
                .build();
    }

    // ========== Private Helper Methods ==========

    private void validateUserDoesNotExist(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile number already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }

        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);

        if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecial) {
            throw new BadRequestException(
                    "Password must contain at least one uppercase letter, one lowercase letter, " +
                            "one digit, and one special character"
            );
        }
    }

    private int generateOtp() {
        Random random = new Random();
        return 100000 + random.nextInt(900000);
    }
}