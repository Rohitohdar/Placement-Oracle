package com.placementoracle.server.dto;

public class ChatScore {

    private double overall;
    private double clarity;
    private double confidence;
    private double technicalDepth;

    public ChatScore() {
    }

    public ChatScore(double overall, double clarity, double confidence, double technicalDepth) {
        this.overall = overall;
        this.clarity = clarity;
        this.confidence = confidence;
        this.technicalDepth = technicalDepth;
    }

    public double getOverall() {
        return overall;
    }

    public void setOverall(double overall) {
        this.overall = overall;
    }

    public double getClarity() {
        return clarity;
    }

    public void setClarity(double clarity) {
        this.clarity = clarity;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public double getTechnicalDepth() {
        return technicalDepth;
    }

    public void setTechnicalDepth(double technicalDepth) {
        this.technicalDepth = technicalDepth;
    }
}
