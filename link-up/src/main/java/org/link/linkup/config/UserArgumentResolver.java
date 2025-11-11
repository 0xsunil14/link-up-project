package org.link.linkup.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.link.linkup.dto.entity.User;
import org.link.linkup.dto.response.user.UserResponse;
import org.link.linkup.exception.UnauthorizedException;
import org.link.linkup.repository.UserRepository;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Resolver to inject authenticated User into controller methods
 */
@Component
@Slf4j
public class UserArgumentResolver implements HandlerMethodArgumentResolver {

    private final UserRepository userRepository;

    public UserArgumentResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        // Support User entity parameter
        return parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory) throws Exception {

        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        HttpSession session = request.getSession(false);

        if (session == null) {
            log.warn("No session found for request: {}", request.getRequestURI());
            throw new UnauthorizedException("Authentication required");
        }

        // Get user from session (stored as UserResponse after login)
        Object sessionUser = session.getAttribute("user");

        if (sessionUser == null) {
            log.warn("No user in session for request: {}", request.getRequestURI());
            throw new UnauthorizedException("Authentication required");
        }

        // Extract user ID from session
        Integer userId;
        if (sessionUser instanceof UserResponse) {
            userId = ((UserResponse) sessionUser).getId();
        } else if (sessionUser instanceof User) {
            userId = ((User) sessionUser).getId();
        } else {
            log.error("Invalid user object in session: {}", sessionUser.getClass());
            throw new UnauthorizedException("Invalid session data");
        }

        // Fetch fresh user from database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found in database: {}", userId);
                    session.invalidate();
                    return new UnauthorizedException("User not found. Please login again.");
                });

        // Verify user is still verified
        if (!user.getVerified()) {
            log.warn("User {} is not verified", userId);
            session.invalidate();
            throw new UnauthorizedException("Account not verified. Please verify your email.");
        }

        log.debug("Resolved user: {} for request: {}", user.getUsername(), request.getRequestURI());

        return user;
    }
}