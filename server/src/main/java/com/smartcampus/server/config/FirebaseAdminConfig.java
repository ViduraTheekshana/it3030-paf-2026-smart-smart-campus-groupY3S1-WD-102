package com.smartcampus.server.config;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FirebaseAdminConfig {

    @Value("${app.firebase.credentials-path:}")
    private String credentialsPath;

    @PostConstruct
    public void initializeFirebase() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        FirebaseOptions.Builder builder = FirebaseOptions.builder();

        if (credentialsPath != null && !credentialsPath.isBlank()) {
            try (InputStream inputStream = Files.newInputStream(Path.of(credentialsPath))) {
                builder.setCredentials(GoogleCredentials.fromStream(inputStream));
            }
        } else {
            builder.setCredentials(GoogleCredentials.getApplicationDefault());
        }

        FirebaseApp.initializeApp(builder.build());
    }
}
