package com.placementoracle.server.service;

import com.placementoracle.server.dto.ChatResponse;

public interface ChatService {

    ChatResponse analyzeMessage(String message);
}
