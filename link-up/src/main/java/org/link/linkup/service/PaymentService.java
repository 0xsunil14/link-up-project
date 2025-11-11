package org.link.linkup.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.link.linkup.dto.entity.User;
import org.link.linkup.exception.BadRequestException;
import org.link.linkup.exception.NotFoundException;
import org.link.linkup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // Prime membership price in paise (199 INR = 19900 paise)
    private static final int PRIME_PRICE = 19900;

    /**
     * Create Razorpay order for Prime membership
     */
    public Map<String, Object> createPrimeOrder(User currentUser) throws RazorpayException {
        log.info("Creating prime order for user: {}", currentUser.getUsername());

        // Check if user is already prime
        if (Boolean.TRUE.equals(currentUser.getPrime())) {
            throw new BadRequestException("User is already a Prime member");
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", PRIME_PRICE);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "prime_" + currentUser.getId() + "_" + System.currentTimeMillis());

            Order order = client.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", razorpayKeyId);
            response.put("userName", currentUser.getFirstname() + " " + currentUser.getLastname());
            response.put("userEmail", currentUser.getEmail());
            response.put("userMobile", currentUser.getMobile().toString());

            String orderId = order.get("id").toString();
            log.info("Prime order created successfully: {}", orderId);

            return response;
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for user: {}", currentUser.getUsername(), e);
            throw e; // Re-throw to be handled by controller
        }
    }

    /**
     * Verify payment and activate Prime
     * Note: In production, you should verify the payment signature
     */
    public void activatePrime(User currentUser) {
        log.info("Activating prime for user: {}", currentUser.getUsername());

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Check if already prime
        if (Boolean.TRUE.equals(user.getPrime())) {
            throw new BadRequestException("User is already a Prime member");
        }

        user.setPrime(true);
        userRepository.save(user);

        log.info("Prime activated successfully for: {}", user.getUsername());
    }

    /**
     * Check prime status
     */
    @Transactional(readOnly = true)
    public boolean isPrime(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        return Boolean.TRUE.equals(user.getPrime());
    }
}