package com.smartcampus.server.config;

import com.smartcampus.server.model.AuthProvider;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@gmail.com";

            if (userRepository.findByEmail(adminEmail).isPresent()) {
                System.out.println("Admin already exists: " + adminEmail);
                return;
            }

            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setEnabled(true);
            admin.setEmailVerified(true);
            admin.setPhoneNumber("0712345678");
            admin.setProvider(AuthProvider.LOCAL);

            // Change this line if your role enum/class name is different
            admin.setRole(com.smartcampus.server.model.Role.ROLE_ADMIN);

            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());

            userRepository.save(admin);
            System.out.println("Admin created: " + adminEmail + " / Admin@123");
        };
    }
}
