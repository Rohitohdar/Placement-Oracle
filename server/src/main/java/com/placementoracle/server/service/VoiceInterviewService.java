package com.placementoracle.server.service;

import com.placementoracle.server.dto.VoiceInterviewResponse;

public interface VoiceInterviewService {

    VoiceInterviewResponse analyze(String text);
}
