package com.placementoracle.server.dto;

public class GithubStatsResponse {

    private int repos;
    private int followers;
    private int stars;

    public GithubStatsResponse() {
    }

    public GithubStatsResponse(int repos, int followers, int stars) {
        this.repos = repos;
        this.followers = followers;
        this.stars = stars;
    }

    public int getRepos() {
        return repos;
    }

    public void setRepos(int repos) {
        this.repos = repos;
    }

    public int getFollowers() {
        return followers;
    }

    public void setFollowers(int followers) {
        this.followers = followers;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }
}
