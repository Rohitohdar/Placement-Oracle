package com.placementoracle.server.service.impl;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.placementoracle.server.dto.GithubRepoDto;
import com.placementoracle.server.dto.GithubStatsResponse;
import com.placementoracle.server.dto.GithubUserDto;
import com.placementoracle.server.exception.GithubRateLimitException;
import com.placementoracle.server.exception.ResourceNotFoundException;
import com.placementoracle.server.service.GithubService;

@Service
public class GithubServiceImpl implements GithubService {

    private static final String GITHUB_API_BASE = "https://api.github.com/users/";
    private static final String USER_AGENT = "PlacementOracleApp";
    private static final Pattern GITHUB_USERNAME_PATTERN = Pattern.compile(
            "^(?:https?://)?(?:www\\.)?github\\.com/([A-Za-z0-9_-]+)\\/?$",
            Pattern.CASE_INSENSITIVE);

    private final RestTemplate restTemplate;

    public GithubServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public GithubStatsResponse getGithubStats(String username) {
        String normalizedUsername = extractUsername(username);
        if (normalizedUsername == null) {
            throw new IllegalArgumentException("Invalid GitHub profile URL");
        }

        try {
            GithubUserDto user = fetchGithubUser(normalizedUsername);
            GithubRepoDto[] repos = fetchGithubRepos(normalizedUsername);

            int totalStars = Arrays.stream(repos)
                    .mapToInt(GithubRepoDto::getStargazersCount)
                    .sum();

            return new GithubStatsResponse(user.getPublicRepos(), user.getFollowers(), totalStars);
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResourceNotFoundException("GitHub user not found");
        } catch (HttpClientErrorException.Forbidden exception) {
            String rateLimitRemaining = exception.getResponseHeaders() == null
                    ? null
                    : exception.getResponseHeaders().getFirst("X-RateLimit-Remaining");
            if ("0".equals(rateLimitRemaining)) {
                throw new GithubRateLimitException("GitHub API rate limit exceeded. Please try again later.");
            }
            throw new IllegalStateException("GitHub API request was forbidden.");
        } catch (HttpClientErrorException exception) {
            throw new IllegalStateException("GitHub API request failed with status: " + exception.getStatusCode());
        }
    }

    private String extractUsername(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String trimmed = value.trim();
        Matcher matcher = GITHUB_USERNAME_PATTERN.matcher(trimmed);
        if (matcher.matches()) {
            return matcher.group(1);
        }

        if (trimmed.matches("^[A-Za-z0-9_-]+$")) {
            return trimmed;
        }

        return null;
    }

    private GithubUserDto fetchGithubUser(String username) {
        RequestEntity<Void> request = RequestEntity
                .get(GITHUB_API_BASE + username)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.USER_AGENT, USER_AGENT)
                .build();

        ResponseEntity<GithubUserDto> response = restTemplate.exchange(request, GithubUserDto.class);
        GithubUserDto body = response.getBody();

        if (body == null) {
            throw new IllegalStateException("GitHub user response was empty");
        }

        return body;
    }

    private GithubRepoDto[] fetchGithubRepos(String username) {
        RequestEntity<Void> request = RequestEntity
                .method(HttpMethod.GET, java.net.URI.create(GITHUB_API_BASE + username + "/repos?per_page=100"))
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.USER_AGENT, USER_AGENT)
                .build();

        ResponseEntity<GithubRepoDto[]> response = restTemplate.exchange(request, GithubRepoDto[].class);
        GithubRepoDto[] body = response.getBody();

        if (body == null) {
            return new GithubRepoDto[0];
        }

        return body;
    }
}
