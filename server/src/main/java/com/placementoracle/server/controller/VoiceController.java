package com.placementoracle.server.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placementoracle.server.dto.VoiceInterviewRequest;
import com.placementoracle.server.dto.VoiceInterviewResponse;
import com.placementoracle.server.service.VoiceInterviewService;

@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceInterviewService voiceInterviewService;

    public VoiceController(VoiceInterviewService voiceInterviewService) {
        this.voiceInterviewService = voiceInterviewService;
    }

    @PostMapping
    public VoiceInterviewResponse analyzeVoice(@RequestBody VoiceInterviewRequest request) {
        return voiceInterviewService.analyze(request.getText());
    }
}
