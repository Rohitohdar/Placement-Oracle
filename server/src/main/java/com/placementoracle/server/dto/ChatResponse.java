package com.placementoracle.server.dto;

import java.util.List;

public class ChatResponse {

    private String feedback;
    private ChatScore score;
    private List<String> suggestions;

    public ChatResponse() {
    }

    public ChatResponse(String feedback, ChatScore score, List<String> suggestions) {
        this.feedback = feedback;
        this.score = score;
        this.suggestions = suggestions;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public ChatScore getScore() {
        return score;
    }

    public void setScore(ChatScore score) {
        this.score = score;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}
