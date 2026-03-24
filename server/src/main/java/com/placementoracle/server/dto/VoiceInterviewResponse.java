package com.placementoracle.server.dto;

public class VoiceInterviewResponse {

    private String feedback;
    private VoiceScore score;

    public VoiceInterviewResponse() {
    }

    public VoiceInterviewResponse(String feedback, VoiceScore score) {
        this.feedback = feedback;
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public VoiceScore getScore() {
        return score;
    }

    public void setScore(VoiceScore score) {
        this.score = score;
    }
}
