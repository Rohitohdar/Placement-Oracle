package com.placementoracle.server.dto;

public class CompanyResult {

    private String companyName;
    private double probability;
    private String status;

    public CompanyResult() {
    }

    public CompanyResult(String companyName, double probability, String status) {
        this.companyName = companyName;
        this.probability = probability;
        this.status = status;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public double getProbability() {
        return probability;
    }

    public void setProbability(double probability) {
        this.probability = probability;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
