package com.placementoracle.server.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GithubRepoDto {

    @JsonProperty("stargazers_count")
    private int stargazersCount;

    public GithubRepoDto() {
    }

    public int getStargazersCount() {
        return stargazersCount;
    }

    public void setStargazersCount(int stargazersCount) {
        this.stargazersCount = stargazersCount;
    }
}
