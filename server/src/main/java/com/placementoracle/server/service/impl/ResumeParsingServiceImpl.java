package com.placementoracle.server.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;

import com.placementoracle.server.dto.ResumeAnalysis;
import com.placementoracle.server.model.User;
import com.placementoracle.server.service.ResumeParsingService;

@Service
public class ResumeParsingServiceImpl implements ResumeParsingService {

    private static final Pattern EXPERIENCE_PATTERN = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*\\+?\\s*(?:years?|yrs?)", Pattern.CASE_INSENSITIVE);

    private static final Map<String, List<String>> KEYWORD_MAP = new LinkedHashMap<>();

    static {
        KEYWORD_MAP.put("Java", List.of(" java ", " core java", "java 8", "java 11", "java 17"));
        KEYWORD_MAP.put("Spring Boot", List.of("spring boot", "springboot"));
        KEYWORD_MAP.put("React", List.of(" react ", "reactjs", "react.js"));
        KEYWORD_MAP.put("JavaScript", List.of(" javascript", " js ", "node.js", "nodejs"));
        KEYWORD_MAP.put("TypeScript", List.of(" typescript", " ts "));
        KEYWORD_MAP.put("MongoDB", List.of(" mongodb", " mongo "));
        KEYWORD_MAP.put("SQL", List.of(" sql", "mysql", "postgresql", "postgres", "oracle database"));
        KEYWORD_MAP.put("REST APIs", List.of("rest api", "restful", "api integration", "web services"));
        KEYWORD_MAP.put("Git", List.of(" git ", "github", "version control"));
        KEYWORD_MAP.put("Docker", List.of(" docker", "containerization"));
        KEYWORD_MAP.put("AWS", List.of(" aws", "amazon web services", "ec2", "s3"));
        KEYWORD_MAP.put("DSA", List.of("data structures", "algorithms", "dsa", "problem solving"));
        KEYWORD_MAP.put("Communication", List.of("communication", "presentation", "stakeholder", "team collaboration"));
        KEYWORD_MAP.put("Microservices", List.of("microservices", "distributed systems"));
        KEYWORD_MAP.put("Python", List.of(" python", "django", "flask"));
    }

    private final Tika tika = new Tika();

    @Override
    public ResumeAnalysis analyzeResume(User user) {
        String resumeText = extractResumeText(user.getResumePath());
        Set<String> detectedSkills = detectKeywords(resumeText, user);
        List<String> detectedProjects = extractProjectHighlights(resumeText);
        double detectedExperienceYears = detectExperienceYears(resumeText, user);
        List<String> technologies = detectTechnologies(detectedSkills);
        List<String> industryRequirements = determineIndustryRequirements(user);
        List<String> missingSkills = industryRequirements.stream()
                .filter(requirement -> !containsIgnoreCase(detectedSkills, requirement) && !containsProfileSkill(user, requirement))
                .toList();

        return new ResumeAnalysis(
                new ArrayList<>(detectedSkills),
                missingSkills,
                detectedProjects,
                technologies,
                roundToTwoDecimals(detectedExperienceYears));
    }

    private String extractResumeText(String resumePath) {
        if (resumePath == null || resumePath.isBlank()) {
            return "";
        }

        Path path = Path.of(resumePath);
        if (!Files.exists(path)) {
            return "";
        }

        try {
            String parsed = tika.parseToString(path);
            return (" " + parsed + " ").replaceAll("\\s+", " ").toLowerCase(Locale.ENGLISH);
        } catch (IOException | TikaException exception) {
            return "";
        }
    }

    private Set<String> detectKeywords(String resumeText, User user) {
        Set<String> detected = new LinkedHashSet<>();

        for (Map.Entry<String, List<String>> entry : KEYWORD_MAP.entrySet()) {
            if (entry.getValue().stream().anyMatch(resumeText::contains)) {
                detected.add(entry.getKey());
            }
        }

        if (user.getSkills() != null) {
            detected.addAll(user.getSkills());
        }

        return detected;
    }

    private List<String> extractProjectHighlights(String resumeText) {
        if (resumeText.isBlank()) {
            return List.of();
        }

        String[] fragments = resumeText.split("(?<=[.!?])\\s+|\\s+-\\s+");
        List<String> highlights = new ArrayList<>();
        for (String fragment : fragments) {
            String trimmed = fragment.trim();
            if (trimmed.isBlank()) {
                continue;
            }

            if (trimmed.contains("project")
                    || trimmed.contains("built")
                    || trimmed.contains("developed")
                    || trimmed.contains("implemented")
                    || trimmed.contains("designed")) {
                highlights.add(capitalizeSentence(trimmed));
            }

            if (highlights.size() == 3) {
                break;
            }
        }

        return highlights;
    }

    private double detectExperienceYears(String resumeText, User user) {
        double detectedYears = 0.0;
        Matcher matcher = EXPERIENCE_PATTERN.matcher(resumeText);
        while (matcher.find()) {
            detectedYears = Math.max(detectedYears, Double.parseDouble(matcher.group(1)));
        }

        if (Boolean.TRUE.equals(user.getWorking()) && user.getYearsOfExperience() != null) {
            detectedYears = Math.max(detectedYears, user.getYearsOfExperience());
        }

        return detectedYears;
    }

    private List<String> detectTechnologies(Set<String> detectedSkills) {
        List<String> technologies = new ArrayList<>();
        for (String skill : detectedSkills) {
            if (!"Communication".equalsIgnoreCase(skill)) {
                technologies.add(skill);
            }
        }
        return technologies.stream().limit(8).toList();
    }

    private List<String> determineIndustryRequirements(User user) {
        String targetCompany = user.getTargetCompany() == null ? "" : user.getTargetCompany().toLowerCase(Locale.ENGLISH);

        if (targetCompany.contains("amazon") || targetCompany.contains("google") || targetCompany.contains("microsoft")) {
            return List.of("DSA", "Java", "SQL", "REST APIs", "Git", "Projects");
        }

        if (targetCompany.contains("tcs") || targetCompany.contains("infosys") || targetCompany.contains("wipro")
                || targetCompany.contains("accenture")) {
            return List.of("Java", "SQL", "Communication", "Git");
        }

        if ("cse".equalsIgnoreCase(user.getBranch()) || "it".equalsIgnoreCase(user.getBranch())) {
            return List.of("Java", "Spring Boot", "React", "REST APIs", "SQL", "Git");
        }

        return List.of("Projects", "Communication", "Git", "REST APIs");
    }

    private boolean containsIgnoreCase(Set<String> values, String target) {
        return values.stream().anyMatch(value -> value.equalsIgnoreCase(target));
    }

    private boolean containsProfileSkill(User user, String target) {
        return user.getSkills() != null && user.getSkills().stream().anyMatch(skill -> skill.equalsIgnoreCase(target));
    }

    private String capitalizeSentence(String value) {
        if (value.isBlank()) {
            return value;
        }

        String normalized = value.replaceAll("\\s+", " ").trim();
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
