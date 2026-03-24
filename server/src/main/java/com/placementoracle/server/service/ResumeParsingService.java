package com.placementoracle.server.service;

import com.placementoracle.server.dto.ResumeAnalysis;
import com.placementoracle.server.model.User;

public interface ResumeParsingService {

    ResumeAnalysis analyzeResume(User user);
}
