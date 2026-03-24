package com.placementoracle.server.dto;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public class UserProfileRequest {

    private String name;
    private String email;
    private Double cgpa;
    private String branch;
    private Integer year;
    private List<String> skills = new ArrayList<>();
    private Integer projects;
    private Integer internships;
    private Double dsaScore;
    private Double communicationScore;
    private Double githubScore;
    private String github;
    private String linkedin;
    private String hackerrank;
    private Boolean working;
    private Double yearsOfExperience;
    private String targetCompany;
    private Double targetPackage;
    private MultipartFile resume;

    public UserProfileRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public Integer getProjects() {
        return projects;
    }

    public void setProjects(Integer projects) {
        this.projects = projects;
    }

    public Integer getInternships() {
        return internships;
    }

    public void setInternships(Integer internships) {
        this.internships = internships;
    }

    public Double getDsaScore() {
        return dsaScore;
    }

    public void setDsaScore(Double dsaScore) {
        this.dsaScore = dsaScore;
    }

    public Double getCommunicationScore() {
        return communicationScore;
    }

    public void setCommunicationScore(Double communicationScore) {
        this.communicationScore = communicationScore;
    }

    public Double getGithubScore() {
        return githubScore;
    }

    public void setGithubScore(Double githubScore) {
        this.githubScore = githubScore;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getHackerrank() {
        return hackerrank;
    }

    public void setHackerrank(String hackerrank) {
        this.hackerrank = hackerrank;
    }

    public Boolean getWorking() {
        return working;
    }

    public void setWorking(Boolean working) {
        this.working = working;
    }

    public Double getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Double yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getTargetCompany() {
        return targetCompany;
    }

    public void setTargetCompany(String targetCompany) {
        this.targetCompany = targetCompany;
    }

    public Double getTargetPackage() {
        return targetPackage;
    }

    public void setTargetPackage(Double targetPackage) {
        this.targetPackage = targetPackage;
    }

    public MultipartFile getResume() {
        return resume;
    }

    public void setResume(MultipartFile resume) {
        this.resume = resume;
    }
}
