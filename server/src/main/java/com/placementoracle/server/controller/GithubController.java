package com.placementoracle.server.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placementoracle.server.dto.GithubStatsResponse;
import com.placementoracle.server.service.GithubService;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    private final GithubService githubService;

    public GithubController(GithubService githubService) {
        this.githubService = githubService;
    }

    @GetMapping("/{username}")
    public GithubStatsResponse getGithubStats(@PathVariable String username) {
        return githubService.getGithubStats(username);
    }
}
