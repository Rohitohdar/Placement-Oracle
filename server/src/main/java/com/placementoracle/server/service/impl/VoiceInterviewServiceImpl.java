package com.placementoracle.server.service.impl;

import java.util.Locale;

import org.springframework.stereotype.Service;

import com.placementoracle.server.dto.VoiceInterviewResponse;
import com.placementoracle.server.dto.VoiceScore;
import com.placementoracle.server.service.ChatService;
import com.placementoracle.server.service.VoiceInterviewService;

@Service
public class VoiceInterviewServiceImpl implements VoiceInterviewService {

    private final ChatService chatService;

    public VoiceInterviewServiceImpl(ChatService chatService) {
        this.chatService = chatService;
    }

    @Override
    public VoiceInterviewResponse analyze(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Voice transcript cannot be empty.");
        }

        String feedback = chatService.analyzeMessage(text).getFeedback();
        VoiceScore score = new VoiceScore(
                calculateConfidence(text),
                calculateClarity(text));

        return new VoiceInterviewResponse(feedback, score);
    }

    private double calculateConfidence(String text) {
        String normalized = normalize(text);
        int wordCount = normalized.isEmpty() ? 0 : normalized.split("\\s+").length;
        int fillerCount = countOccurrences(normalized, " um ")
                + countOccurrences(normalized, " uh ")
                + countOccurrences(normalized, " like ")
                + countOccurrences(normalized, " actually ")
                + countOccurrences(normalized, " basically ");

        double lengthScore = Math.min(wordCount * 2.2, 70.0);
        double fillerPenalty = Math.min(fillerCount * 8.0, 35.0);
        double confidence = Math.max(15.0, Math.min(100.0, 30.0 + lengthScore - fillerPenalty));

        return roundToTwoDecimals(confidence);
    }

    private double calculateClarity(String text) {
        String normalized = normalize(text);
        int wordCount = normalized.isEmpty() ? 0 : normalized.split("\\s+").length;
        boolean hasStructure = normalized.contains("experience")
                || normalized.contains("project")
                || normalized.contains("skill")
                || normalized.contains("internship");
        boolean hasTechSignal = normalized.contains("java")
                || normalized.contains("spring")
                || normalized.contains("react")
                || normalized.contains("python")
                || normalized.contains("backend")
                || normalized.contains("frontend");

        double clarity = Math.min(wordCount * 1.8, 65.0);
        if (hasStructure) {
            clarity += 18.0;
        }
        if (hasTechSignal) {
            clarity += 12.0;
        }

        return roundToTwoDecimals(Math.max(15.0, Math.min(100.0, clarity)));
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return (" " + text.toLowerCase(Locale.ENGLISH).trim() + " ").replaceAll("\\s+", " ");
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
