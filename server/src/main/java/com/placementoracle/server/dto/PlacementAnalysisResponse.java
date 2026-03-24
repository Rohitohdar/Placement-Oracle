package com.placementoracle.server.dto;

import java.util.List;
import java.util.Map;

public class PlacementAnalysisResponse {

    private double overallScore;
    private Map<String, Double> breakdown;
    private List<CompanyResult> companyResults;
    private List<CompanyResult> safeCompanyResults;
    private String safeCompanyMessage;
    private List<String> suggestions;
    private List<RoadmapItem> roadmap;
    private List<String> resumeTips;
    private ResumeAnalysis resumeAnalysis;
    private List<SkillTag> skillTags;
    private TargetAnalysis targetAnalysis;

    public PlacementAnalysisResponse() {
    }

    public PlacementAnalysisResponse(
            double overallScore,
            Map<String, Double> breakdown,
            List<CompanyResult> companyResults,
            List<CompanyResult> safeCompanyResults,
            String safeCompanyMessage,
            List<String> suggestions,
            List<RoadmapItem> roadmap,
            List<String> resumeTips,
            ResumeAnalysis resumeAnalysis,
            List<SkillTag> skillTags,
            TargetAnalysis targetAnalysis) {
        this.overallScore = overallScore;
        this.breakdown = breakdown;
        this.companyResults = companyResults;
        this.safeCompanyResults = safeCompanyResults;
        this.safeCompanyMessage = safeCompanyMessage;
        this.suggestions = suggestions;
        this.roadmap = roadmap;
        this.resumeTips = resumeTips;
        this.resumeAnalysis = resumeAnalysis;
        this.skillTags = skillTags;
        this.targetAnalysis = targetAnalysis;
    }

    public double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(double overallScore) {
        this.overallScore = overallScore;
    }

    public Map<String, Double> getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(Map<String, Double> breakdown) {
        this.breakdown = breakdown;
    }

    public List<CompanyResult> getCompanyResults() {
        return companyResults;
    }

    public void setCompanyResults(List<CompanyResult> companyResults) {
        this.companyResults = companyResults;
    }

    public List<CompanyResult> getSafeCompanyResults() {
        return safeCompanyResults;
    }

    public void setSafeCompanyResults(List<CompanyResult> safeCompanyResults) {
        this.safeCompanyResults = safeCompanyResults;
    }

    public String getSafeCompanyMessage() {
        return safeCompanyMessage;
    }

    public void setSafeCompanyMessage(String safeCompanyMessage) {
        this.safeCompanyMessage = safeCompanyMessage;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<RoadmapItem> getRoadmap() {
        return roadmap;
    }

    public void setRoadmap(List<RoadmapItem> roadmap) {
        this.roadmap = roadmap;
    }

    public List<String> getResumeTips() {
        return resumeTips;
    }

    public void setResumeTips(List<String> resumeTips) {
        this.resumeTips = resumeTips;
    }

    public ResumeAnalysis getResumeAnalysis() {
        return resumeAnalysis;
    }

    public void setResumeAnalysis(ResumeAnalysis resumeAnalysis) {
        this.resumeAnalysis = resumeAnalysis;
    }

    public List<SkillTag> getSkillTags() {
        return skillTags;
    }

    public void setSkillTags(List<SkillTag> skillTags) {
        this.skillTags = skillTags;
    }

    public TargetAnalysis getTargetAnalysis() {
        return targetAnalysis;
    }

    public void setTargetAnalysis(TargetAnalysis targetAnalysis) {
        this.targetAnalysis = targetAnalysis;
    }
}
