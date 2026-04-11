package com.smartcampus.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @Size(max = 500, message = "Profile picture URL must not exceed 500 characters")
    private String profilePictureUrl;

    // Default constructor
    public UpdateProfileRequest() {
    }

    // All-args constructor
    public UpdateProfileRequest(String fullName, String phoneNumber, String profilePictureUrl) {
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.profilePictureUrl = profilePictureUrl;
    }

    // Getters and Setters

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}