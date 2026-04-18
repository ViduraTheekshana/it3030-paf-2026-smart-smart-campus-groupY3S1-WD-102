package com.smartcampus.server.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.smartcampus.server.dto.AuthResponse;
import com.smartcampus.server.dto.FirebaseAuthRequest;
import com.smartcampus.server.exception.BadRequestException;
import com.smartcampus.server.model.AuthProvider;
import com.smartcampus.server.model.Role;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class FirebaseAuthenticationService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public FirebaseAuthenticationService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    public AuthResponse authenticate(FirebaseAuthRequest request) {
        FirebaseToken firebaseToken = verifyToken(request.getIdToken());

        String email = firebaseToken.getEmail();
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Firebase token does not contain an email address.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String providerId = firebaseToken.getUid();
        AuthProvider provider = resolveProvider(firebaseToken);
        String fullName = firebaseToken.getName();
        if (fullName == null || fullName.isBlank()) {
            fullName = normalizedEmail;
        }

        User user = userRepository.findByEmail(normalizedEmail).orElseGet(User::new);

        if (user.getUserId() != null && user.getProvider() == AuthProvider.LOCAL) {
            throw new BadRequestException("This email is already registered with email/password. Please log in with your password.");
        }

        user.setEmail(normalizedEmail);
        user.setFullName(fullName);
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setProfilePictureUrl(firebaseToken.getPicture());
        user.setEmailVerified(Boolean.TRUE.equals(firebaseToken.isEmailVerified()));
        user.setEnabled(true);
        user.setLastLoginAt(LocalDateTime.now());
        if (user.getRole() == null) {
            user.setRole(Role.ROLE_USER);
        }

        userRepository.save(user);
        return authService.buildAuthResponse(user);
    }

    private FirebaseToken verifyToken(String idToken) {
        try {
            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException ex) {
            throw new BadRequestException("Invalid Firebase ID token: " + ex.getMessage());
        }
    }

    private AuthProvider resolveProvider(FirebaseToken firebaseToken) {
        Object firebaseClaim = firebaseToken.getClaims().get("firebase");
        if (!(firebaseClaim instanceof java.util.Map<?, ?> firebaseMap)) {
            return AuthProvider.GOOGLE;
        }
        Object provider = firebaseMap.get("sign_in_provider");
        if ("facebook.com".equals(provider)) {
            return AuthProvider.FACEBOOK;
        }
        if ("google.com".equals(provider)) {
            return AuthProvider.GOOGLE;
        }

        return AuthProvider.GOOGLE;
    }
}
