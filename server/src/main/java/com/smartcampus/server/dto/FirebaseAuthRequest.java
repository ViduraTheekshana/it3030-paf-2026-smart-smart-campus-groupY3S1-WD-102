package com.smartcampus.server.dto;

import jakarta.validation.constraints.NotBlank;

public class FirebaseAuthRequest {

    @NotBlank
    private String idToken;

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
