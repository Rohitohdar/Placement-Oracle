package com.placementoracle.server.dto;

public class AdminUserResponse {

    private String id;
    private String name;
    private String email;
    private double score;
    private String github;

    public AdminUserResponse() {
    }

    public AdminUserResponse(String id, String name, String email, double score, String github) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.score = score;
        this.github = github;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }
}
