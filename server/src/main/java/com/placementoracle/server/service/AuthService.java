package com.placementoracle.server.service;

import com.placementoracle.server.dto.AuthResponse;
import com.placementoracle.server.dto.LoginRequest;
import com.placementoracle.server.dto.SignupRequest;

public interface AuthService {

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);

    void createDefaultAdmin();
}
