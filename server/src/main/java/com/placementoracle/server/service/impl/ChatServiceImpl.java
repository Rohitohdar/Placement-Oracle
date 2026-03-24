package com.placementoracle.server.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.placementoracle.server.dto.ChatScore;
import com.placementoracle.server.dto.ChatResponse;
import com.placementoracle.server.service.ChatService;

@Service
public class ChatServiceImpl implements ChatService {

    private static final Set<String> TECH_KEYWORDS = new HashSet<>(Arrays.asList(
            "java", "spring", "springboot", "react", "node", "python", "javascript", "typescript",
            "mongodb", "mysql", "postgresql", "redis", "docker", "kubernetes", "aws", "api",
            "backend", "frontend", "microservice", "database", "cloud", "rest", "graphql"));

    @Override
    public ChatResponse analyzeMessage(String message) {
        String trimmed = message == null ? "" : message.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }

        String lower = trimmed.toLowerCase(Locale.ENGLISH);
        List<String> suggestions = new ArrayList<>();
        int wordCount = trimmed.split("\\s+").length;
        boolean hasProjects = containsAny(lower, "project", "projects", "built", "developed", "created", "designed");
        boolean hasImpact = containsAny(lower, "impact", "improved", "reduced", "increased", "optimized", "users", "performance");
        boolean hasRoleOwnership = containsAny(lower, "i worked", "i built", "i led", "i designed", "i implemented", "my role");
        boolean hasStructure = hasStructure(trimmed);
        boolean tooShort = wordCount < 18 || trimmed.length() < 70;
        int technicalKeywordCount = countTechKeywords(lower);

        if (tooShort) {
            suggestions.add("Expand your answer with 2 to 3 more sentences about what you built, how you built it, and the outcome.");
        }

        if (!hasProjects) {
            suggestions.add("Mention at least one project or internship so the answer feels grounded in real experience.");
        }

        if (technicalKeywordCount < 2) {
            suggestions.add("Mention your tech stack clearly, for example Java, Spring Boot, React, MongoDB, or APIs.");
        }

        if (!hasImpact) {
            suggestions.add("Add project impact, such as performance improvements, users served, automation, or problem solved.");
        }

        if (!hasStructure) {
            suggestions.add("Use a simple structure: background, project/work, tech stack, and result.");
        }

        double clarity = calculateClarity(trimmed, wordCount, hasStructure, hasImpact);
        double confidence = calculateConfidence(trimmed, wordCount, hasRoleOwnership);
        double technicalDepth = calculateTechnicalDepth(wordCount, technicalKeywordCount, hasProjects, hasImpact);
        double overall = roundToTwoDecimals((clarity * 0.35) + (confidence * 0.25) + (technicalDepth * 0.40));

        String feedback = buildFeedback(overall, tooShort, technicalKeywordCount, hasImpact, hasProjects);
        return new ChatResponse(feedback, new ChatScore(overall, clarity, confidence, technicalDepth), suggestions);
    }

    private boolean containsAny(String value, String... keywords) {
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasStructure(String text) {
        boolean startsWell = Character.isUpperCase(text.charAt(0));
        boolean endsWell = text.endsWith(".") || text.endsWith("!") || text.endsWith("?");
        int sentenceCount = text.split("[.!?]+").length;
        return startsWell && endsWell && sentenceCount >= 2;
    }

    private int countTechKeywords(String lower) {
        int count = 0;
        for (String keyword : TECH_KEYWORDS) {
            if (lower.contains(keyword)) {
                count++;
            }
        }
        return count;
    }

    private double calculateClarity(String text, int wordCount, boolean hasStructure, boolean hasImpact) {
        double score = 32.0;
        score += Math.min(wordCount * 1.1, 22.0);
        if (hasStructure) {
            score += 24.0;
        }
        if (hasImpact) {
            score += 10.0;
        }
        return roundToTwoDecimals(Math.min(score, 100.0));
    }

    private double calculateConfidence(String text, int wordCount, boolean hasRoleOwnership) {
        String normalized = " " + text.toLowerCase(Locale.ENGLISH).trim() + " ";
        int fillerCount = countOccurrences(normalized, " um ")
                + countOccurrences(normalized, " uh ")
                + countOccurrences(normalized, " like ")
                + countOccurrences(normalized, " basically ");

        double score = 38.0;
        score += Math.min(wordCount * 0.8, 20.0);
        if (hasRoleOwnership) {
            score += 18.0;
        }
        score -= Math.min(fillerCount * 7.0, 20.0);
        return roundToTwoDecimals(Math.max(20.0, Math.min(score, 100.0)));
    }

    private double calculateTechnicalDepth(int wordCount, int technicalKeywordCount, boolean hasProjects, boolean hasImpact) {
        double score = 22.0;
        score += Math.min(technicalKeywordCount * 12.0, 36.0);
        if (hasProjects) {
            score += 18.0;
        }
        if (hasImpact) {
            score += 10.0;
        }
        score += Math.min(Math.max(wordCount - 20, 0) * 0.5, 14.0);
        return roundToTwoDecimals(Math.min(score, 100.0));
    }

    private String buildFeedback(
            double overall,
            boolean tooShort,
            int technicalKeywordCount,
            boolean hasImpact,
            boolean hasProjects) {
        if (tooShort) {
            return "Your answer is too short right now. Add more detail about what you built and why it mattered.";
        }

        if (technicalKeywordCount < 2 && !hasImpact) {
            return "Good answer, but mention your tech stack and project impact.";
        }

        if (!hasProjects) {
            return "Decent answer, but anchor it with a project, internship, or hands-on example.";
        }

        if (overall >= 80.0) {
            return "Strong answer. It sounds structured, relevant, and technically grounded.";
        }

        if (overall >= 60.0) {
            return "Good answer, but it would be stronger with clearer technical depth and measurable impact.";
        }

        return "Your answer has a useful base, but it needs more structure, technical detail, and ownership.";
    }

    private int countOccurrences(String text, String token) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(token, index)) != -1) {
            count++;
            index += token.length();
        }
        return count;
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
