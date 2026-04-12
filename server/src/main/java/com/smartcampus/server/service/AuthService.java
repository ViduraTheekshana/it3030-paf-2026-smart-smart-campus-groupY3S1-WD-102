package com.smartcampus.server.service;

import com.smartcampus.server.dto.AuthResponse;
import com.smartcampus.server.dto.ForgotPasswordRequest;
import com.smartcampus.server.dto.LoginRequest;
import com.smartcampus.server.dto.ResetPasswordRequest;
import com.smartcampus.server.dto.RegisterRequest;
import com.smartcampus.server.dto.UserDTO;
import com.smartcampus.server.exception.BadRequestException;
import com.smartcampus.server.model.AuthProvider;
import com.smartcampus.server.model.PasswordResetToken;
import com.smartcampus.server.model.Role;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.PasswordResetTokenRepository;
import com.smartcampus.server.repository.UserRepository;
import com.smartcampus.server.security.JwtService;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       AuthenticationManager authenticationManager,
                       CustomUserDetailsService customUserDetailsService,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.authenticationManager = authenticationManager;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(true);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found."));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException("This account uses " + user.getProvider() + " sign-in.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse buildAuthResponse(User user) {
        var userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, Map.of(
                "role", user.getRole().name(),
                "userId", user.getUserId()
        ));
        return new AuthResponse(token, UserDTO.fromEntity(user));
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            return null;
        }

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException("This account uses " + user.getProvider() + " sign-in. Please sign in with your provider.");
        }

        passwordResetTokenRepository.deleteByUser_UserId(user.getUserId());

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        return resetToken.getToken();
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid password reset token."));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This password reset token has already been used.");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This password reset token has expired.");
        }

        User user = resetToken.getUser();
        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException("This account uses " + user.getProvider() + " sign-in and does not support local password reset.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}

