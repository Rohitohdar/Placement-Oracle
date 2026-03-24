package com.placementoracle.server.service;

import java.util.List;
import java.util.Optional;

import com.placementoracle.server.dto.UserProfileRequest;
import com.placementoracle.server.model.User;

public interface UserService {

    User saveUser(UserProfileRequest request);

    User saveAuthUser(User user);

    User getUserById(String id);

    Optional<User> findByEmail(String email);

    List<User> getAllUsers();

    void deleteUserById(String id);

    void deleteAllUsers();
}
