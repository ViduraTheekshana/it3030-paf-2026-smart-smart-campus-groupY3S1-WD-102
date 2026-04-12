package com.smartcampus.server.repository;

import com.smartcampus.server.model.PasswordResetOtp;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findByUserUserIdAndOtpCodeAndUsedFalse(Long userId, String otpCode);

    void deleteByUserUserId(Long userId);
}
