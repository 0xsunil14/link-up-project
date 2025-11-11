package org.link.linkup.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class EmailSender {

    @Autowired
    JavaMailSender mailSender;

    @Autowired
    TemplateEngine engine;

    public void sendOtp(String to, int otp, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("patilsunil9019@gmail.com", "LinkUp Application");
            helper.setTo(to);
            helper.setSubject("Verify Your Email - LinkUp");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("otp", otp);

            String body = engine.process("otp-template", context);
            helper.setText(body, true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}