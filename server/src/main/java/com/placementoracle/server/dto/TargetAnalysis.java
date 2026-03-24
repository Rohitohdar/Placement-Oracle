package com.placementoracle.server.dto;

import java.util.List;

public class TargetAnalysis {

    private boolean eligible;
    private String reason;
    private List<String> skillGap;
    private List<RoadmapItem> roadmap;

    public TargetAnalysis() {
    }

    public TargetAnalysis(boolean eligible, String reason, List<String> skillGap, List<RoadmapItem> roadmap) {
        this.eligible = eligible;
        this.reason = reason;
        this.skillGap = skillGap;
        this.roadmap = roadmap;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public List<String> getSkillGap() {
        return skillGap;
    }

    public void setSkillGap(List<String> skillGap) {
        this.skillGap = skillGap;
    }

    public List<RoadmapItem> getRoadmap() {
        return roadmap;
    }

    public void setRoadmap(List<RoadmapItem> roadmap) {
        this.roadmap = roadmap;
    }
}
