package com.placementoracle.server.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.placementoracle.server.dto.CompanyResult;
import com.placementoracle.server.dto.PlacementAnalysisResponse;
import com.placementoracle.server.dto.ResumeAnalysis;
import com.placementoracle.server.dto.RoadmapItem;
import com.placementoracle.server.dto.SkillTag;
import com.placementoracle.server.dto.TargetAnalysis;
import com.placementoracle.server.model.User;
import com.placementoracle.server.service.PlacementScoringService;
import com.placementoracle.server.service.ResumeParsingService;

@Service
public class PlacementScoringServiceImpl implements PlacementScoringService {

    private static final double FRESHER_DSA_WEIGHT = 0.30;
    private static final double FRESHER_PROJECTS_WEIGHT = 0.20;
    private static final double FRESHER_GITHUB_WEIGHT = 0.15;
    private static final double FRESHER_CGPA_WEIGHT = 0.10;
    private static final double FRESHER_COMMUNICATION_WEIGHT = 0.10;
    private static final double FRESHER_INTERNSHIPS_WEIGHT = 0.15;

    private static final double EXPERIENCED_DSA_WEIGHT = 0.24;
    private static final double EXPERIENCED_PROJECTS_WEIGHT = 0.24;
    private static final double EXPERIENCED_GITHUB_WEIGHT = 0.12;
    private static final double EXPERIENCED_CGPA_WEIGHT = 0.08;
    private static final double EXPERIENCED_COMMUNICATION_WEIGHT = 0.10;
    private static final double EXPERIENCED_INTERNSHIPS_WEIGHT = 0.07;
    private static final double EXPERIENCED_WORK_WEIGHT = 0.15;
    private static final double RESUME_FIT_WEIGHT = 0.08;

    private final ResumeParsingService resumeParsingService;

    public PlacementScoringServiceImpl(ResumeParsingService resumeParsingService) {
        this.resumeParsingService = resumeParsingService;
    }

    @Override
    public double calculateScore(User user) {
        ResumeAnalysis resumeAnalysis = resumeParsingService.analyzeResume(user);
        ScoreWeights weights = getWeights(user);
        double projectScore = adjustedProjectScore(user, resumeAnalysis);
        double workExperienceScore = adjustedExperienceScore(user, resumeAnalysis);
        double resumeFitScore = calculateResumeFitScore(resumeAnalysis);
        return roundToTwoDecimals(
                normalizePercentage(user.getDsaScore()) * weights.dsaWeight()
                        + projectScore * weights.projectsWeight()
                        + normalizePercentage(user.getGithubScore()) * weights.githubWeight()
                        + normalizeCgpa(user.getCgpa()) * weights.cgpaWeight()
                        + normalizePercentage(user.getCommunicationScore()) * weights.communicationWeight()
                        + normalizeCount(user.getInternships(), 5) * weights.internshipsWeight()
                        + workExperienceScore * weights.workExperienceWeight()
                        + resumeFitScore * RESUME_FIT_WEIGHT);
    }

    @Override
    public PlacementAnalysisResponse analyze(User user) {
        ResumeAnalysis resumeAnalysis = resumeParsingService.analyzeResume(user);
        double overallScore = calculateScore(user, resumeAnalysis);
        ScoreWeights weights = getWeights(user);
        double projectScore = adjustedProjectScore(user, resumeAnalysis);
        double workExperienceScore = adjustedExperienceScore(user, resumeAnalysis);
        double resumeFitScore = calculateResumeFitScore(resumeAnalysis);
        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("dsa", roundToTwoDecimals(normalizePercentage(user.getDsaScore()) * weights.dsaWeight()));
        breakdown.put("projects", roundToTwoDecimals(projectScore * weights.projectsWeight()));
        breakdown.put("github", roundToTwoDecimals(normalizePercentage(user.getGithubScore()) * weights.githubWeight()));
        breakdown.put("cgpa", roundToTwoDecimals(normalizeCgpa(user.getCgpa()) * weights.cgpaWeight()));
        breakdown.put("communication",
                roundToTwoDecimals(normalizePercentage(user.getCommunicationScore()) * weights.communicationWeight()));
        breakdown.put("internships",
                roundToTwoDecimals(normalizeCount(user.getInternships(), 5) * weights.internshipsWeight()));
        if (isExperienced(user)) {
            breakdown.put("workExperience",
                    roundToTwoDecimals(workExperienceScore * weights.workExperienceWeight()));
        }
        breakdown.put("resumeFit", roundToTwoDecimals(resumeFitScore * RESUME_FIT_WEIGHT));

        return new PlacementAnalysisResponse(
                overallScore,
                breakdown,
                predict(user),
                recommendSafeCompanies(user, overallScore),
                buildSafeCompanyMessage(overallScore),
                generateSuggestions(user),
                generateRoadmap(user),
                generateResumeTips(user),
                resumeAnalysis,
                generateSkillTags(user),
                analyzeTarget(user));
    }

    private double calculateScore(User user, ResumeAnalysis resumeAnalysis) {
        ScoreWeights weights = getWeights(user);
        double projectScore = adjustedProjectScore(user, resumeAnalysis);
        double workExperienceScore = adjustedExperienceScore(user, resumeAnalysis);
        double resumeFitScore = calculateResumeFitScore(resumeAnalysis);

        return roundToTwoDecimals(
                normalizePercentage(user.getDsaScore()) * weights.dsaWeight()
                        + projectScore * weights.projectsWeight()
                        + normalizePercentage(user.getGithubScore()) * weights.githubWeight()
                        + normalizeCgpa(user.getCgpa()) * weights.cgpaWeight()
                        + normalizePercentage(user.getCommunicationScore()) * weights.communicationWeight()
                        + normalizeCount(user.getInternships(), 5) * weights.internshipsWeight()
                        + workExperienceScore * weights.workExperienceWeight()
                        + resumeFitScore * RESUME_FIT_WEIGHT);
    }

    @Override
    public List<CompanyResult> predict(User user) {
        List<CompanyResult> results = new ArrayList<>();

        double cgpa = safeCgpa(user.getCgpa());
        double dsa = normalizePercentage(user.getDsaScore());
        double communication = normalizePercentage(user.getCommunicationScore());
        double projects = normalizeCount(user.getProjects(), 10);
        double experience = normalizeExperience(user);

        results.add(buildCompanyResult(
                "TCS",
                cgpa > 6.0,
                average(progress(cgpa, 6.0), progress(experience, 35.0)),
                55.0));

        results.add(buildCompanyResult(
                "Infosys",
                cgpa > 7.0,
                average(progress(cgpa, 7.0)),
                52.0));

        results.add(buildCompanyResult(
                "Accenture",
                cgpa > 7.0 && communication > 60.0,
                average(progress(cgpa, 7.0), progress(communication, 60.0), progress(experience, 40.0)),
                50.0));

        results.add(buildCompanyResult(
                "Amazon",
                dsa > 80.0 && projects > 70.0,
                average(progress(dsa, 80.0), progress(projects, 70.0), progress(experience, 50.0)),
                40.0));

        results.add(buildCompanyResult(
                "Microsoft",
                dsa > 85.0,
                average(progress(dsa, 85.0), progress(experience, 50.0)),
                38.0));

        results.add(buildCompanyResult(
                "Google",
                dsa > 90.0,
                average(progress(dsa, 90.0), progress(experience, 55.0)),
                35.0));

        return results;
    }

    private List<CompanyResult> recommendSafeCompanies(User user, double overallScore) {
        List<CompanyResult> safeCompanies = new ArrayList<>();

        if (overallScore >= 60.0) {
            return safeCompanies;
        }

        double cgpa = safeCgpa(user.getCgpa());
        double communication = normalizePercentage(user.getCommunicationScore());
        double experience = normalizeExperience(user);

        safeCompanies.add(buildCompanyResult(
                "TCS",
                cgpa > 6.0,
                average(progress(cgpa, 6.0), progress(communication, 50.0), progress(experience, 35.0)),
                58.0));

        safeCompanies.add(buildCompanyResult(
                "Infosys",
                cgpa > 7.0,
                average(progress(cgpa, 7.0), progress(communication, 55.0), progress(experience, 35.0)),
                55.0));

        safeCompanies.add(buildCompanyResult(
                "Wipro",
                cgpa > 6.0,
                average(progress(cgpa, 6.0), progress(communication, 50.0), progress(experience, 35.0)),
                56.0));

        return safeCompanies;
    }

    private String buildSafeCompanyMessage(double overallScore) {
        if (overallScore < 60.0) {
            return "You should first target these companies while improving your profile for dream companies.";
        }

        return "";
    }

    @Override
    public List<String> generateSuggestions(User user) {
        List<String> suggestions = new ArrayList<>();

        double dsa = normalizePercentage(user.getDsaScore());
        double projects = normalizeCount(user.getProjects(), 10);
        double github = normalizePercentage(user.getGithubScore());
        double communication = normalizePercentage(user.getCommunicationScore());
        double cgpa = normalizeCgpa(user.getCgpa());
        double internships = normalizeCount(user.getInternships(), 5);
        double experience = normalizeExperience(user);

        if (dsa < 65.0) {
            suggestions.add("Improve DSA by practicing arrays, trees, graphs, and mock coding rounds consistently.");
        }

        if (projects < 60.0) {
            suggestions.add("Add projects with real-world scope, deployment links, and clear documentation.");
        }

        if (github < 55.0) {
            suggestions.add("Increase GitHub activity with regular commits, polished repositories, and README improvements.");
        }

        if (communication < 60.0) {
            suggestions.add("Strengthen communication through mock HR interviews and concise project presentations.");
        }

        if (cgpa < 70.0) {
            suggestions.add("Work on improving CGPA to expand eligibility across service and product companies.");
        }

        if (internships < 40.0) {
            suggestions.add("Pursue internships, freelance work, or open-source contributions to gain practical experience.");
        }

        if (isExperienced(user) && experience < 50.0) {
            suggestions.add("Show stronger real work ownership by highlighting delivery impact, collaboration, and measurable outcomes from your experience.");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Your profile looks balanced. Focus on advanced mock interviews and company-specific preparation.");
        }

        ResumeAnalysis resumeAnalysis = resumeParsingService.analyzeResume(user);
        if (!resumeAnalysis.getMissingSkills().isEmpty()) {
            suggestions.add("Close resume-industry skill gaps by adding " + String.join(", ", resumeAnalysis.getMissingSkills().stream().limit(3).toList()) + " to your preparation plan.");
        }

        return suggestions;
    }

    @Override
    public List<RoadmapItem> generateRoadmap(User user) {
        List<RoadmapItem> roadmap = new ArrayList<>();

        double dsa = normalizePercentage(user.getDsaScore());
        double projects = normalizeCount(user.getProjects(), 10);
        double github = normalizePercentage(user.getGithubScore());
        double communication = normalizePercentage(user.getCommunicationScore());
        double experience = normalizeExperience(user);

        if (dsa < 65.0) {
            roadmap.add(new RoadmapItem(
                    "Week 1: Learn Arrays and Patterns",
                    "Practice arrays, strings, and hashing problems for 45 minutes daily."));
            roadmap.add(new RoadmapItem(
                    "Week 2: Solve DSA Mock Sets",
                    "Move into linked lists, trees, and timed problem-solving sessions."));
        }

        if (projects < 60.0) {
            roadmap.add(new RoadmapItem(
                    "Week 3: Build a Portfolio Project",
                    "Create one full-stack project with deployment, README, and clean architecture."));
        }

        if (github < 55.0) {
            roadmap.add(new RoadmapItem(
                    "Week 4: Improve GitHub Presence",
                    "Push regular commits, organize repositories, and document your best work."));
        }

        if (communication < 60.0) {
            roadmap.add(new RoadmapItem(
                    "Week 5: Practice Interview Communication",
                    "Record self-introductions, explain projects clearly, and do two mock HR rounds."));
        }

        if (isExperienced(user) && experience < 50.0) {
            roadmap.add(new RoadmapItem(
                    "Week 6: Package Work Experience Better",
                    "Turn your recent work into strong impact stories with metrics, ownership, and business outcomes."));
        }

        if (roadmap.isEmpty()) {
            roadmap.add(new RoadmapItem(
                    "Week 1: Target Company Practice",
                    "Solve company-tagged interview questions and refine your strongest project story."));
            roadmap.add(new RoadmapItem(
                    "Week 2: Mock Interviews and Resume Polish",
                    "Run technical mocks, improve resume bullet points, and prepare role-specific answers."));
        }

        return roadmap;
    }

    @Override
    public List<String> generateResumeTips(User user) {
        List<String> tips = new ArrayList<>();

        if (normalizeCount(user.getProjects(), 10) < 60.0) {
            tips.add("Add 2 to 3 impact-focused project bullets with measurable outcomes and deployed links.");
        }

        if (normalizePercentage(user.getGithubScore()) < 55.0) {
            tips.add("Include your GitHub profile and highlight repositories with stars, commits, or strong documentation.");
        }

        if (normalizeCount(user.getInternships(), 5) < 40.0) {
            tips.add("Show practical exposure through internships, freelance work, open-source contributions, or live client work.");
        }

        if (normalizePercentage(user.getCommunicationScore()) < 60.0) {
            tips.add("Rewrite resume bullets in a clear action-result format to improve clarity during interviews.");
        }

        if (isExperienced(user) && normalizeExperience(user) < 50.0) {
            tips.add("Highlight real work ownership with concise bullets that show systems handled, outcomes delivered, and technologies used in production.");
        }

        if (tips.isEmpty()) {
            tips.add("Your resume base is solid. Focus on role-specific tailoring and stronger quantified achievements.");
        }

        ResumeAnalysis resumeAnalysis = resumeParsingService.analyzeResume(user);
        if (!resumeAnalysis.getMissingSkills().isEmpty()) {
            tips.add("Add evidence for missing industry skills such as " + String.join(", ", resumeAnalysis.getMissingSkills().stream().limit(3).toList()) + " if you have worked with them.");
        }

        return tips;
    }

    @Override
    public List<SkillTag> generateSkillTags(User user) {
        List<SkillTag> tags = new ArrayList<>();

        addSkillTag(tags, "DSA", normalizePercentage(user.getDsaScore()));
        addSkillTag(tags, "Projects", normalizeCount(user.getProjects(), 10));
        addSkillTag(tags, "GitHub", normalizePercentage(user.getGithubScore()));
        addSkillTag(tags, "Communication", normalizePercentage(user.getCommunicationScore()));
        addSkillTag(tags, "Internships", normalizeCount(user.getInternships(), 5));
        if (isExperienced(user)) {
            addSkillTag(tags, "Work Experience", normalizeExperience(user));
        }
        ResumeAnalysis resumeAnalysis = resumeParsingService.analyzeResume(user);
        if (!resumeAnalysis.getDetectedSkills().isEmpty()) {
            addSkillTag(tags, "Resume Match", calculateResumeFitScore(resumeAnalysis));
        }

        return tags;
    }

    @Override
    public TargetAnalysis analyzeTarget(User user) {
        if (user.getTargetCompany() == null || user.getTargetCompany().isBlank()) {
            return null;
        }

        String targetCompany = user.getTargetCompany().trim();
        String normalizedCompany = targetCompany.toLowerCase(Locale.ENGLISH);
        double overall = calculateScore(user);
        double dsa = normalizePercentage(user.getDsaScore());
        double projects = normalizeCount(user.getProjects(), 10);
        double communication = normalizePercentage(user.getCommunicationScore());
        double cgpa = safeCgpa(user.getCgpa());
        double github = normalizePercentage(user.getGithubScore());
        double experience = normalizeExperience(user);
        double targetPackage = user.getTargetPackage() == null ? 0.0 : user.getTargetPackage();

        List<String> skillGap = new ArrayList<>();
        List<RoadmapItem> roadmap = new ArrayList<>();
        boolean eligible = true;

        if (matchesCompany(normalizedCompany, "amazon")) {
            if (dsa < 80.0) {
                eligible = false;
                skillGap.add("DSA score should be at least 80 for Amazon-focused preparation.");
            }
            if (projects < 70.0) {
                eligible = false;
                skillGap.add("Project quality and depth need to reach a stronger level for Amazon-style interviews.");
            }
        } else if (matchesCompany(normalizedCompany, "microsoft")) {
            if (dsa < 85.0) {
                eligible = false;
                skillGap.add("DSA score should be at least 85 for Microsoft.");
            }
        } else if (matchesCompany(normalizedCompany, "google")) {
            if (dsa < 90.0) {
                eligible = false;
                skillGap.add("DSA score should be at least 90 for Google.");
            }
        } else if (matchesCompany(normalizedCompany, "accenture")) {
            if (cgpa <= 7.0) {
                eligible = false;
                skillGap.add("CGPA should be above 7 for Accenture.");
            }
            if (communication <= 60.0) {
                eligible = false;
                skillGap.add("Communication score should be above 60 for Accenture.");
            }
        } else if (matchesCompany(normalizedCompany, "infosys")) {
            if (cgpa <= 7.0) {
                eligible = false;
                skillGap.add("CGPA should be above 7 for Infosys.");
            }
        } else if (matchesCompany(normalizedCompany, "tcs")) {
            if (cgpa <= 6.0) {
                eligible = false;
                skillGap.add("CGPA should be above 6 for TCS.");
            }
        } else {
            if (overall < 65.0) {
                eligible = false;
                skillGap.add("Your overall readiness should be stronger for a competitive startup or small-company target.");
            }
            if (dsa < 65.0) {
                eligible = false;
                skillGap.add("Improve DSA to handle startup screening rounds and problem-solving interviews.");
            }
            if (projects < 60.0) {
                eligible = false;
                skillGap.add("Build stronger projects to demonstrate practical product-building ability.");
            }
            if (github < 50.0) {
                eligible = false;
                skillGap.add("Improve GitHub activity to show proof of consistent engineering work.");
            }
            if (isExperienced(user) && experience < 50.0) {
                eligible = false;
                skillGap.add("Strengthen your real work experience narrative with stronger ownership, shipped outcomes, and technical depth.");
            }
        }

        if (targetPackage >= 12.0 && overall < 78.0) {
            eligible = false;
            skillGap.add("Your current overall profile is below the usual readiness level for the selected package target.");
        } else if (targetPackage >= 8.0 && overall < 68.0) {
            eligible = false;
            skillGap.add("Raise your overall profile strength to better match the selected package target.");
        }

        String reason;
        if (eligible) {
            reason = "You are currently on track for " + targetCompany
                    + (targetPackage > 0 ? " and your target package of " + roundToTwoDecimals(targetPackage) + " LPA." : ".");
            roadmap.add(new RoadmapItem("Week 1: Maintain Core DSA", "Keep solving medium-level problems and revisit patterns that match your target company."));
            roadmap.add(new RoadmapItem("Week 2: Targeted Mock Interviews", "Practice role-specific technical and behavioral questions for " + targetCompany + "."));
            roadmap.add(new RoadmapItem("Week 3: Polish Project Impact", "Refine your project stories, metrics, and resume bullets before interviews."));
        } else {
            reason = buildTargetReason(targetCompany, skillGap);
            roadmap.addAll(buildTargetRoadmap(dsa, projects, communication, github, experience, targetCompany, isExperienced(user)));
        }

        return new TargetAnalysis(eligible, reason, skillGap, roadmap);
    }

    private double normalizePercentage(Double value) {
        return clamp(value == null ? 0.0 : value, 0.0, 100.0);
    }

    private double normalizeCgpa(Double value) {
        double cgpa = clamp(value == null ? 0.0 : value, 0.0, 10.0);
        return cgpa * 10.0;
    }

    private double normalizeCount(Integer value, int max) {
        double count = value == null ? 0.0 : value;
        return (clamp(count, 0.0, max) / max) * 100.0;
    }

    private double normalizeExperience(User user) {
        if (!isExperienced(user)) {
            return 0.0;
        }

        return clamp((user.getYearsOfExperience() == null ? 0.0 : user.getYearsOfExperience()) / 5.0 * 100.0, 0.0, 100.0);
    }

    private double adjustedExperienceScore(User user, ResumeAnalysis resumeAnalysis) {
        double parsedExperienceScore = clamp((resumeAnalysis.getDetectedExperienceYears() / 5.0) * 100.0, 0.0, 100.0);
        return Math.max(normalizeExperience(user), parsedExperienceScore);
    }

    private double adjustedProjectScore(User user, ResumeAnalysis resumeAnalysis) {
        double manualProjectScore = normalizeCount(user.getProjects(), 10);
        double resumeProjectScore = clamp(resumeAnalysis.getDetectedProjects().size() * 30.0, 0.0, 100.0);
        double technologyDepthScore = clamp(resumeAnalysis.getTechnologies().size() * 10.0, 0.0, 100.0);
        return Math.max(manualProjectScore, average(resumeProjectScore, technologyDepthScore));
    }

    private double calculateResumeFitScore(ResumeAnalysis resumeAnalysis) {
        if (resumeAnalysis.getDetectedSkills().isEmpty() && resumeAnalysis.getDetectedProjects().isEmpty()) {
            return 0.0;
        }

        double detectedSkillScore = clamp(resumeAnalysis.getDetectedSkills().size() * 10.0, 0.0, 100.0);
        double projectScore = clamp(resumeAnalysis.getDetectedProjects().size() * 25.0, 0.0, 100.0);
        double missingPenalty = clamp(resumeAnalysis.getMissingSkills().size() * 12.0, 0.0, 60.0);
        return clamp(average(detectedSkillScore, projectScore) - missingPenalty, 0.0, 100.0);
    }

    private double safeCgpa(Double value) {
        return clamp(value == null ? 0.0 : value, 0.0, 10.0);
    }

    private boolean matchesCompany(String normalizedCompany, String expected) {
        return normalizedCompany.contains(expected);
    }

    private boolean isExperienced(User user) {
        return Boolean.TRUE.equals(user.getWorking()) && user.getYearsOfExperience() != null && user.getYearsOfExperience() > 0;
    }

    private String buildTargetReason(String company, List<String> skillGap) {
        if (skillGap.isEmpty()) {
            return "You are not yet eligible for " + company + " based on your current profile.";
        }

        String firstGap = skillGap.get(0);
        if (firstGap.toLowerCase(Locale.ENGLISH).contains("dsa")) {
            return "You are not eligible for " + company + " due to low DSA score.";
        }

        if (firstGap.toLowerCase(Locale.ENGLISH).contains("project")) {
            return "You are not eligible for " + company + " because your project depth is currently below the target requirement.";
        }

        if (firstGap.toLowerCase(Locale.ENGLISH).contains("communication")) {
            return "You are not eligible for " + company + " because communication readiness is below the target requirement.";
        }

        return "You are not yet eligible for " + company + ". Strengthen the highlighted gaps first.";
    }

    private List<RoadmapItem> buildTargetRoadmap(
            double dsa,
            double projects,
            double communication,
            double github,
            double experience,
            String company,
            boolean experienced) {
        List<RoadmapItem> roadmap = new ArrayList<>();

        if (dsa < 70.0) {
            roadmap.addAll(Arrays.asList(
                    new RoadmapItem("Week 1: DSA basics", "Revise arrays, strings, hashing, and time complexity fundamentals."),
                    new RoadmapItem("Week 2: Practice problems", "Solve curated medium-level problems and track weak patterns daily.")));
        }

        if (projects < 65.0) {
            roadmap.add(new RoadmapItem("Week 3: Build project", "Create or improve a full-stack project with deployment, README, and measurable impact."));
        }

        if (communication < 65.0) {
            roadmap.add(new RoadmapItem("Week 4: Interview communication", "Practice self-introductions, project walkthroughs, and mock HR rounds for " + company + "."));
        }

        if (github < 55.0) {
            roadmap.add(new RoadmapItem("Week 5: GitHub polish", "Clean up repositories, add documentation, and push consistent commits to show engineering discipline."));
        }

        if (experienced && experience < 55.0) {
            roadmap.add(new RoadmapItem("Week 6: Strengthen work stories", "Prepare experience-based answers that show production ownership, cross-team work, and measurable business impact for " + company + "."));
        }

        if (roadmap.isEmpty()) {
            roadmap.add(new RoadmapItem("Week 1: Targeted company preparation", "Practice likely interview rounds and sharpen your strongest proof points for " + company + "."));
        }

        return roadmap;
    }

    private CompanyResult buildCompanyResult(String companyName, boolean eligible, double readiness, double floor) {
        double scaledReadiness = clamp(readiness * 100.0, 0.0, 100.0);
        double probability = eligible
                ? Math.max(floor, scaledReadiness)
                : Math.min(floor - 5.0, scaledReadiness);

        return new CompanyResult(
                companyName,
                roundToTwoDecimals(probability),
                eligible ? "Eligible" : "Not Eligible");
    }

    private double progress(double actual, double required) {
        if (required <= 0) {
            return 1.0;
        }

        return clamp(actual / required, 0.0, 1.0);
    }

    private double average(double... values) {
        if (values.length == 0) {
            return 0.0;
        }

        double total = 0.0;
        for (double value : values) {
            total += value;
        }
        return total / values.length;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private void addSkillTag(List<SkillTag> tags, String skill, double score) {
        String level;
        if (score >= 75.0) {
            level = "STRONG";
        } else if (score >= 50.0) {
            level = "MODERATE";
        } else {
            level = "WEAK";
        }

        tags.add(new SkillTag(skill, level, roundToTwoDecimals(score)));
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private ScoreWeights getWeights(User user) {
        if (isExperienced(user)) {
            return new ScoreWeights(
                    EXPERIENCED_DSA_WEIGHT,
                    EXPERIENCED_PROJECTS_WEIGHT,
                    EXPERIENCED_GITHUB_WEIGHT,
                    EXPERIENCED_CGPA_WEIGHT,
                    EXPERIENCED_COMMUNICATION_WEIGHT,
                    EXPERIENCED_INTERNSHIPS_WEIGHT,
                    EXPERIENCED_WORK_WEIGHT);
        }

        return new ScoreWeights(
                FRESHER_DSA_WEIGHT,
                FRESHER_PROJECTS_WEIGHT,
                FRESHER_GITHUB_WEIGHT,
                FRESHER_CGPA_WEIGHT,
                FRESHER_COMMUNICATION_WEIGHT,
                FRESHER_INTERNSHIPS_WEIGHT,
                0.0);
    }

    private record ScoreWeights(
            double dsaWeight,
            double projectsWeight,
            double githubWeight,
            double cgpaWeight,
            double communicationWeight,
            double internshipsWeight,
            double workExperienceWeight) {
    }
}
