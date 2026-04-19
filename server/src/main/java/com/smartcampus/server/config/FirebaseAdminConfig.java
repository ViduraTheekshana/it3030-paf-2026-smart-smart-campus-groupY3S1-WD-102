package com.smartcampus.server.config;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class FirebaseAdminConfig {

    @Value("${app.firebase.project-id}")
    private String projectId;

    @Value("${app.firebase.client-email}")
    private String clientEmail;

    @Value("${app.firebase.private-key}")
    private String privateKey;

    @Value("${app.firebase.private-key-id}")
    private String privateKeyId;

    @Value("${app.firebase.client-id}")
    private String clientId;

    @PostConstruct
    public void initializeFirebase() throws IOException {
        final java.util.logging.Logger logger =
                java.util.logging.Logger.getLogger(FirebaseAdminConfig.class.getName());

        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        String formattedKey = privateKey.replace("\\n", "\n");

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(ServiceAccountCredentials.fromPkcs8(
                        clientId,
                        clientEmail,
                        formattedKey,
                        privateKeyId,
                        null
                ))
                .setProjectId(projectId)
                .build();

        FirebaseApp.initializeApp(options);
        logger.info("Firebase Admin SDK initialized successfully");
    }
}
