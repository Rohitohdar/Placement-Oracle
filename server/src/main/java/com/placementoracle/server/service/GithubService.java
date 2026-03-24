package com.placementoracle.server.service;

import com.placementoracle.server.dto.GithubStatsResponse;

public interface GithubService {

    GithubStatsResponse getGithubStats(String username);
}
