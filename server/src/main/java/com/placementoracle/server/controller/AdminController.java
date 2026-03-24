package com.placementoracle.server.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placementoracle.server.dto.AdminUserResponse;
import com.placementoracle.server.model.User;
import com.placementoracle.server.service.AuthService;
import com.placementoracle.server.service.PlacementScoringService;
import com.placementoracle.server.service.UserService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PlacementScoringService placementScoringService;
    private final AuthService authService;

    public AdminController(
            UserService userService,
            PlacementScoringService placementScoringService,
            AuthService authService) {
        this.userService = userService;
        this.placementScoringService = placementScoringService;
        this.authService = authService;
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(this::toResponse)
                .toList();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        if ("admin@placement.com".equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Default admin account cannot be deleted.");
        }
        userService.deleteUserById(id);
    }

    @DeleteMapping("/reset")
    public void resetAllData() {
        userService.deleteAllUsers();
        authService.createDefaultAdmin();
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName() == null || user.getName().isBlank() ? "Unnamed User" : user.getName(),
                user.getEmail(),
                placementScoringService.calculateScore(user),
                user.getGithub());
    }
}
