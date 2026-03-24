package com.placementoracle.server.service;

import java.util.List;

import com.placementoracle.server.dto.CompanyResult;
import com.placementoracle.server.dto.PlacementAnalysisResponse;
import com.placementoracle.server.dto.RoadmapItem;
import com.placementoracle.server.dto.SkillTag;
import com.placementoracle.server.dto.TargetAnalysis;
import com.placementoracle.server.model.User;

public interface PlacementScoringService {

    double calculateScore(User user);

    List<CompanyResult> predict(User user);

    List<String> generateSuggestions(User user);

    List<RoadmapItem> generateRoadmap(User user);

    List<String> generateResumeTips(User user);

    List<SkillTag> generateSkillTags(User user);

    TargetAnalysis analyzeTarget(User user);

    PlacementAnalysisResponse analyze(User user);
}
