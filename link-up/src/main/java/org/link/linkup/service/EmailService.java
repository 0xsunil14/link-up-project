package org.link.linkup.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.link.linkup.helper.EmailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final EmailSender emailSender;

    /**
     * Send OTP email
     */
    public void sendOtp(String email, int otp, String username) {
        log.info("Sending OTP to: {}", email);

        try {
            emailSender.sendOtp(email, otp, username);
            log.info("OTP sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP to: {}", email, e);
            throw new RuntimeException("Failed to send OTP email. Please try again later.");
        }
    }
}