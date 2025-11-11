package org.link.linkup.util;

import org.link.linkup.helper.AES;
import org.springframework.stereotype.Component;

@Component
public class PasswordEncoder {

    /**
     * Encode password using AES encryption
     */
    public String encode(String rawPassword) {
        return AES.encrypt(rawPassword);
    }

    /**
     * Check if raw password matches encoded password
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        String decrypted = AES.decrypt(encodedPassword);
        return rawPassword.equals(decrypted);
    }
}