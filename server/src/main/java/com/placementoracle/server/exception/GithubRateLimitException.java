package com.placementoracle.server.exception;

public class GithubRateLimitException extends RuntimeException {

    public GithubRateLimitException(String message) {
        super(message);
    }
}
