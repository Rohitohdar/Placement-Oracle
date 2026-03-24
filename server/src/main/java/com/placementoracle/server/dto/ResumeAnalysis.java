package com.placementoracle.server.dto;

import java.util.ArrayList;
import java.util.List;

public class ResumeAnalysis {

    private List<String> detectedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> detectedProjects = new ArrayList<>();
    private List<String> technologies = new ArrayList<>();
    private double detectedExperienceYears;

    public ResumeAnalysis() {
    }

    public ResumeAnalysis(
            List<String> detectedSkills,
            List<String> missingSkills,
            List<String> detectedProjects,
            List<String> technologies,
            double detectedExperienceYears) {
        this.detectedSkills = detectedSkills;
        this.missingSkills = missingSkills;
        this.detectedProjects = detectedProjects;
        this.technologies = technologies;
        this.detectedExperienceYears = detectedExperienceYears;
    }

    public List<String> getDetectedSkills() {
        return detectedSkills;
    }

    public void setDetectedSkills(List<String> detectedSkills) {
        this.detectedSkills = detectedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getDetectedProjects() {
        return detectedProjects;
    }

    public void setDetectedProjects(List<String> detectedProjects) {
        this.detectedProjects = detectedProjects;
    }

    public List<String> getTechnologies() {
        return technologies;
    }

    public void setTechnologies(List<String> technologies) {
        this.technologies = technologies;
    }

    public double getDetectedExperienceYears() {
        return detectedExperienceYears;
    }

    public void setDetectedExperienceYears(double detectedExperienceYears) {
        this.detectedExperienceYears = detectedExperienceYears;
    }
}
