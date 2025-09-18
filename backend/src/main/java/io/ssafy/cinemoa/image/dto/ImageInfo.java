package io.ssafy.cinemoa.image.dto;

import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageInfo {

    private byte[] imageData;
    private String contentType;

    public static ImageInfo of(Path filePath) throws IOException {
        if (!Files.exists(filePath)) {
            throw ResourceNotFoundException.ofImage();
        }

        byte[] imageBytes = Files.readAllBytes(filePath);
        String contentType = getImageContentType(filePath);

        return ImageInfo.builder()
                .imageData(imageBytes)
                .contentType(contentType)
                .build();
    }

    private static String getImageContentType(Path filePath) {
        String fileName = filePath.getFileName().toString().toLowerCase();

        if (fileName.endsWith(".jpg")) {
            return "image/jpeg";
        }
        if (fileName.endsWith(".png")) {
            return "image/png";
        }
        if (fileName.endsWith(".gif")) {
            return "image/gif";
        }
        if (fileName.endsWith(".mp4")) {
            return "video/mp4";
        }
        return "text/plain";
    }

}
