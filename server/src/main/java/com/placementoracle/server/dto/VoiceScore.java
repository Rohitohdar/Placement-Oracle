package com.placementoracle.server.dto;

public class VoiceScore {

    private double confidence;
    private double clarity;

    public VoiceScore() {
    }

    public VoiceScore(double confidence, double clarity) {
        this.confidence = confidence;
        this.clarity = clarity;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public double getClarity() {
        return clarity;
    }

    public void setClarity(double clarity) {
        this.clarity = clarity;
    }
}
