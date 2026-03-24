package com.placementoracle.server.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GithubUserDto {

    @JsonProperty("public_repos")
    private int publicRepos;

    private int followers;
    private int following;

    public GithubUserDto() {
    }

    public int getPublicRepos() {
        return publicRepos;
    }

    public void setPublicRepos(int publicRepos) {
        this.publicRepos = publicRepos;
    }

    public int getFollowers() {
        return followers;
    }

    public void setFollowers(int followers) {
        this.followers = followers;
    }

    public int getFollowing() {
        return following;
    }

    public void setFollowing(int following) {
        this.following = following;
    }
}
