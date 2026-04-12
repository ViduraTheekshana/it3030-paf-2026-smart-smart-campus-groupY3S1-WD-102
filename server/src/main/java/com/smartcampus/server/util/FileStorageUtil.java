package com.smartcampus.server.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Component
public class FileStorageUtil {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    public String store(MultipartFile file, UUID ticketId) throws IOException {
        validateFile(file);

        Path uploadPath = Paths.get(uploadDir, "tickets", ticketId.toString());
        Files.createDirectories(uploadPath);

        String extension = getExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + "." + extension;
        Path destination = uploadPath.resolve(storedName);

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return destination.toString();
    }

    public void delete(String filePath) throws IOException {
        Files.deleteIfExists(Paths.get(filePath));
    }

    public byte[] load(String filePath) throws IOException {
        return Files.readAllBytes(Paths.get(filePath));
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds the 5MB size limit");
        }
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
