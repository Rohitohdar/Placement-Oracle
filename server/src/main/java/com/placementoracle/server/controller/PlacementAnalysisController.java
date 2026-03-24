package com.placementoracle.server.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placementoracle.server.dto.PlacementAnalysisResponse;
import com.placementoracle.server.model.User;
import com.placementoracle.server.service.PlacementScoringService;

@RestController
@RequestMapping("/api")
public class PlacementAnalysisController {

    private final PlacementScoringService placementScoringService;

    public PlacementAnalysisController(PlacementScoringService placementScoringService) {
        this.placementScoringService = placementScoringService;
    }

    @PostMapping("/analyze")
    public PlacementAnalysisResponse analyze(@RequestBody User user) {
        if (user.getName() == null || user.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required for analysis.");
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required for analysis.");
        }

        return placementScoringService.analyze(user);
    }
}
