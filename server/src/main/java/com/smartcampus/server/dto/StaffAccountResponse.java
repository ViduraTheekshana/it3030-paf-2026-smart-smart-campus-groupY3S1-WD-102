package com.smartcampus.server.dto;

public class StaffAccountResponse {

    private UserDTO user;
    private String temporaryPassword;

    // Default constructor
    public StaffAccountResponse() {
    }

    // All-args constructor
    public StaffAccountResponse(UserDTO user, String temporaryPassword) {
        this.user = user;
        this.temporaryPassword = temporaryPassword;
    }

    // Getters and Setters

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }
}
