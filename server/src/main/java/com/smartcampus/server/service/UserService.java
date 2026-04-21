package com.smartcampus.server.service;
import java.time.LocalDateTime;
import com.smartcampus.server.dto.ChangePasswordRequest;
import com.smartcampus.server.dto.CreateStaffUserRequest;
import com.smartcampus.server.dto.StaffAccountResponse;
import com.smartcampus.server.dto.UpdateProfileRequest;
import com.smartcampus.server.dto.UserDTO;
import com.smartcampus.server.exception.ResourceNotFoundException;
import com.smartcampus.server.model.AuthProvider;
import com.smartcampus.server.model.Role;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.UserRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // constructor injection
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // BASIC USER METHODS
    // =========================

    public User getEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    public UserDTO getProfile(String email) {
        return UserDTO.fromEntity(getEntityByEmail(email));
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    // =========================
    // ROLE MANAGEMENT
    // =========================

    public UserDTO updateRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + userId));

        user.setRole(role);
        return UserDTO.fromEntity(userRepository.save(user));
    }

    // =========================
    // PROFILE UPDATE
    // =========================

    public UserDTO updateProfile(String email, UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProfilePictureUrl(request.getProfilePictureUrl());

        User updatedUser = userRepository.save(user);

        return UserDTO.fromEntity(updatedUser);
    }

    // =========================
    // STAFF ACCOUNT CREATION
    // =========================

    public StaffAccountResponse createStaffUser(CreateStaffUserRequest request) {

        // ❌ Do NOT allow USER role
        if (request.getRole() == Role.ROLE_USER) {
            throw new RuntimeException("Staff creation endpoint is only for elevated roles.");
        }

        // ❌ Prevent duplicate emails
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new RuntimeException("Email is already registered.");
        }

        // ✅ Generate temporary password
        String tempPassword = generateTemporaryPassword();

        // ✅ Create user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(request.getRole());

        // OAuth related defaults
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(true);
        user.setEmailVerified(false);

        // ✅ Save
        User saved = userRepository.save(user);

        // ✅ Return response
        return new StaffAccountResponse(
                UserDTO.fromEntity(saved),
                tempPassword
        );
    }


    // =========================
    // CHANGE PASSWORD
    // =========================

    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled.");
        }

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Password change is only available for local accounts.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be the same as the current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }


    // =========================
    // TEMP PASSWORD GENERATOR
    // =========================

    private String generateTemporaryPassword() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 10) + "A1!";
    }
}
