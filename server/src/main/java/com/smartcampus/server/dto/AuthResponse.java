package com.smartcampus.server.dto;

public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserDTO user;

    public AuthResponse() {}
    public AuthResponse(String accessToken, UserDTO user) {
        this.accessToken = accessToken;
        this.user = user;
    }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }
}
