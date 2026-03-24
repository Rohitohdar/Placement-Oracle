package com.placementoracle.server.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.placementoracle.server.dto.UserProfileRequest;
import com.placementoracle.server.exception.ResourceNotFoundException;
import com.placementoracle.server.model.User;
import com.placementoracle.server.repository.UserRepository;
import com.placementoracle.server.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private static final Pattern GITHUB_PROFILE_PATTERN = Pattern.compile(
            "^(?:https?://)?(?:www\\.)?github\\.com/([A-Za-z0-9_-]+)/?$",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern LINKEDIN_PROFILE_PATTERN = Pattern.compile(
            "^(?:https?://)?(?:www\\.)?linkedin\\.com/in/([A-Za-z0-9_-]+)/?$",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern HACKERRANK_PROFILE_PATTERN = Pattern.compile(
            "^(?:https?://)?(?:www\\.)?hackerrank\\.com/([A-Za-z0-9_-]+)/?$",
            Pattern.CASE_INSENSITIVE);

    private final UserRepository userRepository;
    private final Path uploadDirectory;
    private final Map<String, User> fallbackUsers = new ConcurrentHashMap<>();
    private final Map<String, User> fallbackUsersByEmail = new ConcurrentHashMap<>();

    public UserServiceImpl(
            UserRepository userRepository,
            @Value("${app.upload.dir:uploads}") String uploadDirectory) {
        this.userRepository = userRepository;
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    @Override
    public User saveUser(UserProfileRequest request) {
        validateProfileRequest(request);
        String resumePath = storeResume(request.getResume());
        User user = findByEmail(request.getEmail()).orElseGet(User::new);
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (user.getRole() == null) {
            user.setRole(com.placementoracle.server.model.Role.USER);
        }
        user.setCgpa(request.getCgpa());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setSkills(request.getSkills());
        user.setProjects(request.getProjects());
        user.setInternships(request.getInternships());
        user.setDsaScore(request.getDsaScore());
        user.setCommunicationScore(request.getCommunicationScore());
        user.setGithubScore(request.getGithubScore());
        user.setGithub(normalizeProfileUrl(request.getGithub(), GITHUB_PROFILE_PATTERN, "https://github.com/"));
        user.setLinkedin(normalizeProfileUrl(request.getLinkedin(), LINKEDIN_PROFILE_PATTERN, "https://www.linkedin.com/in/"));
        user.setHackerrank(normalizeProfileUrl(request.getHackerrank(), HACKERRANK_PROFILE_PATTERN, "https://www.hackerrank.com/"));
        user.setWorking(Boolean.TRUE.equals(request.getWorking()));
        user.setYearsOfExperience(Boolean.TRUE.equals(request.getWorking()) ? request.getYearsOfExperience() : 0.0);
        user.setTargetCompany(request.getTargetCompany());
        user.setTargetPackage(request.getTargetPackage());
        if (resumePath != null) {
            user.setResumePath(resumePath);
        }

        return saveWithFallback(user);
    }

    @Override
    public User saveAuthUser(User user) {
        return saveWithFallback(user);
    }

    @Override
    public User getUserById(String id) {
        try {
            return userRepository.findById(id)
                    .orElseGet(() -> getFallbackUser(id));
        } catch (RuntimeException exception) {
            return getFallbackUser(id);
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            return Optional.empty();
        }

        try {
            Optional<User> repositoryUser = userRepository.findByEmail(normalizedEmail);
            if (repositoryUser.isPresent()) {
                return repositoryUser;
            }
        } catch (RuntimeException exception) {
            // Fall back to in-memory storage below.
        }

        return Optional.ofNullable(fallbackUsersByEmail.get(normalizedEmail));
    }

    @Override
    public List<User> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            if (!users.isEmpty()) {
                users.forEach(this::cacheFallbackUser);
                return users;
            }
        } catch (RuntimeException exception) {
            // Fall back to in-memory users below.
        }

        return fallbackUsers.values().stream().toList();
    }

    @Override
    public void deleteUserById(String id) {
        User existingUser = getUserById(id);

        try {
            userRepository.deleteById(id);
        } catch (RuntimeException exception) {
            // Continue cleanup from in-memory fallback below.
        }

        fallbackUsers.remove(id);
        if (existingUser.getEmail() != null) {
            fallbackUsersByEmail.remove(normalizeEmail(existingUser.getEmail()));
        }
    }

    @Override
    public void deleteAllUsers() {
        try {
            userRepository.deleteAll();
        } catch (RuntimeException exception) {
            // Continue cleanup from in-memory fallback below.
        }

        fallbackUsers.clear();
        fallbackUsersByEmail.clear();
    }

    private User saveWithFallback(User user) {
        user.setEmail(normalizeEmail(user.getEmail()));
        try {
            User savedUser = userRepository.save(user);
            cacheFallbackUser(savedUser);
            return savedUser;
        } catch (RuntimeException exception) {
            if (user.getId() == null || user.getId().isBlank()) {
                user.setId(UUID.randomUUID().toString());
            }
            cacheFallbackUser(user);
            return user;
        }
    }

    private User getFallbackUser(String id) {
        User fallbackUser = fallbackUsers.get(id);
        if (fallbackUser == null) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        return fallbackUser;
    }

    private void cacheFallbackUser(User user) {
        fallbackUsers.put(user.getId(), user);
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            fallbackUsersByEmail.put(normalizeEmail(user.getEmail()), user);
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private String storeResume(MultipartFile resume) {
        if (resume == null || resume.isEmpty()) {
            return null;
        }

        try {
            Files.createDirectories(uploadDirectory);

            String originalFilename = StringUtils.cleanPath(
                    resume.getOriginalFilename() == null ? "resume" : resume.getOriginalFilename());
            String storedFilename = UUID.randomUUID() + "-" + originalFilename.replace(" ", "_");
            Path targetFile = uploadDirectory.resolve(storedFilename);

            try (InputStream inputStream = resume.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return targetFile.toString();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store resume file", exception);
        }
    }

    private void validateProfileRequest(UserProfileRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required.");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        if (request.getCgpa() == null || request.getCgpa() < 0 || request.getCgpa() > 10) {
            throw new IllegalArgumentException("CGPA must be between 0 and 10.");
        }

        if (request.getBranch() == null || request.getBranch().isBlank()) {
            throw new IllegalArgumentException("Branch is required.");
        }

        if (request.getYear() == null || request.getYear() < 1 || request.getYear() > 4) {
            throw new IllegalArgumentException("Year must be between 1 and 4.");
        }

        if (request.getProjects() == null || request.getProjects() < 0 || request.getProjects() > 10) {
            throw new IllegalArgumentException("Projects must be between 0 and 10.");
        }

        if (request.getInternships() == null || request.getInternships() < 0 || request.getInternships() > 5) {
            throw new IllegalArgumentException("Internships must be between 0 and 5.");
        }

        if (request.getDsaScore() == null || request.getDsaScore() < 0 || request.getDsaScore() > 100) {
            throw new IllegalArgumentException("DSA score must be between 0 and 100.");
        }

        if (request.getCommunicationScore() == null
                || request.getCommunicationScore() < 0
                || request.getCommunicationScore() > 100) {
            throw new IllegalArgumentException("Communication score must be between 0 and 100.");
        }

        if (request.getYearsOfExperience() != null
                && (request.getYearsOfExperience() < 0 || request.getYearsOfExperience() > 20)) {
            throw new IllegalArgumentException("Years of experience must be between 0 and 20.");
        }

        if (Boolean.TRUE.equals(request.getWorking())
                && (request.getYearsOfExperience() == null || request.getYearsOfExperience() <= 0)) {
            throw new IllegalArgumentException("Years of experience must be greater than 0 when you are working.");
        }

        if (request.getGithub() != null
                && !request.getGithub().isBlank()
                && extractUsername(request.getGithub(), GITHUB_PROFILE_PATTERN) == null) {
            throw new IllegalArgumentException("Invalid GitHub profile URL");
        }

        if (request.getHackerrank() != null
                && !request.getHackerrank().isBlank()
                && extractUsername(request.getHackerrank(), HACKERRANK_PROFILE_PATTERN) == null) {
            throw new IllegalArgumentException("Invalid HackerRank profile URL");
        }
    }

    private String normalizeProfileUrl(String value, Pattern pattern, String baseUrl) {
        String username = extractUsername(value, pattern);
        return username == null ? null : baseUrl + username;
    }

    private String extractUsername(String value, Pattern pattern) {
        if (value == null || value.isBlank()) {
            return null;
        }

        Matcher matcher = pattern.matcher(value.trim());
        if (!matcher.matches()) {
            return null;
        }

        return matcher.group(1);
    }
}
