package org.link.linkup.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.link.linkup.helper.CloudinaryHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final CloudinaryHelper cloudinaryHelper;

    // Maximum file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Allowed image types
    private static final String[] ALLOWED_IMAGE_TYPES = {
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    };

    /**
     * Upload image to Cloudinary
     */
    public String uploadImage(MultipartFile file) {
        log.info("Uploading image: {}", file.getOriginalFilename());

        validateFile(file);

        try {
            String imageUrl = cloudinaryHelper.saveImage(file);
            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;
        } catch (Exception e) {
            log.error("Failed to upload image: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to upload image. Please try again.");
        }
    }

    /**
     * Validate file before upload
     */
    private void validateFile(MultipartFile file) {
        // Check if file is empty
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new IllegalArgumentException(
                    "Only image files are allowed (JPEG, PNG, GIF, WebP)"
            );
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("File size must be less than %dMB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }

        // Validate filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid filename");
        }
    }

    /**
     * Check if content type is valid image type
     */
    private boolean isValidImageType(String contentType) {
        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (allowedType.equalsIgnoreCase(contentType)) {
                return true;
            }
        }
        return false;
    }
}