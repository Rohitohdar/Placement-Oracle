package com.placementoracle.server.dto;

public class SkillTag {

    private String skill;
    private String level;
    private double score;

    public SkillTag() {
    }

    public SkillTag(String skill, String level, double score) {
        this.skill = skill;
        this.level = level;
        this.score = score;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }
}
