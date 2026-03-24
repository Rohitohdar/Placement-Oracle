package com.placementoracle.server.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.placementoracle.server.service.AuthService;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    public CommandLineRunner adminBootstrapRunner(AuthService authService) {
        return args -> authService.createDefaultAdmin();
    }
}
