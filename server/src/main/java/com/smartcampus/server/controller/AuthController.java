package com.smartcampus.server.controller;
import com.smartcampus.server.dto.AuthResponse;
import com.smartcampus.server.dto.ForgotPasswordOtpRequest;
import com.smartcampus.server.dto.ForgotPasswordRequest;
import com.smartcampus.server.dto.LoginRequest;
import com.smartcampus.server.dto.RegisterRequest;
import com.smartcampus.server.dto.ResetPasswordRequest;
import com.smartcampus.server.dto.ResetPasswordWithOtpRequest;
import com.smartcampus.server.dto.FirebaseAuthRequest;
import com.smartcampus.server.dto.VerifyOtpRequest;
import com.smartcampus.server.service.AuthService;
import com.smartcampus.server.service.PasswordOtpService;
import com.smartcampus.server.service.FirebaseAuthenticationService;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordOtpService passwordOtpService;
    private final FirebaseAuthenticationService firebaseAuthenticationService;

    public AuthController(AuthService authService,
                          PasswordOtpService passwordOtpService,
                          FirebaseAuthenticationService firebaseAuthenticationService) {
        this.authService = authService;
        this.passwordOtpService = passwordOtpService;
        this.firebaseAuthenticationService = firebaseAuthenticationService;
    }
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

    AuthResponse response = authService.login(request);

    String token = response.getAccessToken(); // make sure this exists

    ResponseCookie cookie = ResponseCookie.from("token", token)
            .httpOnly(true)
            .secure(false) // change to true in production
            .path("/")
            .maxAge(60 * 60 * 24) // 1 day
            .sameSite("Lax")
            .build();

    return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of("message", "Login successful"));
}

    @PostMapping("/firebase")
public ResponseEntity<?> firebaseLogin(@Valid @RequestBody FirebaseAuthRequest request) {

    AuthResponse response = firebaseAuthenticationService.authenticate(request);

    String token = response.getAccessToken();

    ResponseCookie cookie = ResponseCookie.from("token", token)
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(60 * 60 * 24)
            .sameSite("Lax")
            .build();

    return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of("message", "Login successful"));
}

@PostMapping("/logout")
public ResponseEntity<?> logout() {

    ResponseCookie cookie = ResponseCookie.from("token", "")
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(0)
            .build();

    return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of("message", "Logged out"));
}
    // Old token-based forgot password flow
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = authService.forgotPassword(request);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "If an account exists with that email, a password reset link has been generated.");

        if (token != null) {
            response.put("resetToken", token);
        }

        return ResponseEntity.ok(response);
    }

    // Old token-based reset password flow
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successful."));
    }

    // New OTP-based forgot password flow
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody ForgotPasswordOtpRequest request) {
        passwordOtpService.sendOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to email."));
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        passwordOtpService.verifyOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully."));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, String>> resetPasswordWithOtp(
            @Valid @RequestBody ResetPasswordWithOtpRequest request) {
        passwordOtpService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successful."));
    }

}
