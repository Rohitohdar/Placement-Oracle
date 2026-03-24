package com.placementoracle.server.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.placementoracle.server.dto.AuthResponse;
import com.placementoracle.server.dto.LoginRequest;
import com.placementoracle.server.dto.SignupRequest;
import com.placementoracle.server.model.Role;
import com.placementoracle.server.model.User;
import com.placementoracle.server.security.JwtService;
import com.placementoracle.server.service.AuthService;
import com.placementoracle.server.service.UserService;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserService userService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse signup(SignupRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            logger.warn("Signup validation failed due to missing email or password.");
            throw new IllegalArgumentException("Email and password are required.");
        }

        if (userService.findByEmail(request.getEmail()).isPresent()) {
            logger.warn("Signup blocked because user already exists for email={}", request.getEmail());
            throw new IllegalArgumentException("User already exists with this email.");
        }

        User user = new User();
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        User savedUser = userService.saveAuthUser(user);
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        logger.info("Signup successful for email={} role={}", savedUser.getEmail(), savedUser.getRole());

        return new AuthResponse(
                "Signup successful",
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            logger.warn("Login validation failed due to missing email or password.");
            throw new IllegalArgumentException("Email and password are required.");
        }

        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login failed because user was not found for email={}", request.getEmail());
                    return new SecurityException("Invalid email or password.");
                });

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Login failed because password did not match for email={}", request.getEmail());
            throw new SecurityException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        logger.info("Login successful for email={} role={}", user.getEmail(), user.getRole());
        return new AuthResponse(
                "Login successful",
                token,
                user.getId(),
                user.getEmail(),
                user.getRole().name());
    }

    @Override
    public void createDefaultAdmin() {
        if (userService.findByEmail("admin@placement.com").isPresent()) {
            return;
        }

        User admin = new User();
        admin.setName("Placement Admin");
        admin.setEmail("admin@placement.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userService.saveAuthUser(admin);
    }
}
