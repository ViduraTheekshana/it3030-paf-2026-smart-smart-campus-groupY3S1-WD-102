package com.smartcampus.server.service;

import com.smartcampus.server.dto.ForgotPasswordOtpRequest;
import com.smartcampus.server.dto.ResetPasswordWithOtpRequest;
import com.smartcampus.server.dto.VerifyOtpRequest;
import com.smartcampus.server.exception.BadRequestException;
import com.smartcampus.server.exception.ResourceNotFoundException;
import com.smartcampus.server.model.AuthProvider;
import com.smartcampus.server.model.PasswordResetOtp;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.PasswordResetOtpRepository;
import com.smartcampus.server.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordOtpService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    public PasswordOtpService(UserRepository userRepository,
                              PasswordResetOtpRepository otpRepository,
                              PasswordEncoder passwordEncoder,
                              MailService mailService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
    }

    public void sendOtp(ForgotPasswordOtpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException(
                    "This account uses " + user.getProvider()
                            + " sign-in. Please sign in with your provider."
            );
        }

        otpRepository.deleteByUser_UserId(user.getUserId());

        String otpCode = generateOtp();

        PasswordResetOtp otp = new PasswordResetOtp();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        otp.setUsed(false);

        otpRepository.save(otp);

        mailService.sendOtpEmail(user.getEmail(), otpCode);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException(
                    "This account uses " + user.getProvider()
                            + " sign-in and does not support local password reset."
            );
        }

        PasswordResetOtp otp = otpRepository
                .findByUser_UserIdAndOtpCodeAndUsedFalse(user.getUserId(), request.getOtp())
                .orElseThrow(() -> new BadRequestException("Invalid OTP."));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired.");
        }
    }

    public void resetPassword(ResetPasswordWithOtpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BadRequestException(
                    "This account uses " + user.getProvider()
                            + " sign-in and does not support local password reset."
            );
        }

        PasswordResetOtp otp = otpRepository
                .findByUser_UserIdAndOtpCodeAndUsedFalse(user.getUserId(), request.getOtp())
                .orElseThrow(() -> new BadRequestException("Invalid OTP."));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);
    }

    private String generateOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }
}
