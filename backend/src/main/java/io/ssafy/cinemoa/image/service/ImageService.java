package io.ssafy.cinemoa.image.service;

import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.image.config.ImageConfig;
import io.ssafy.cinemoa.image.dto.AnimatorResult;
import io.ssafy.cinemoa.image.dto.ImageInfo;
import io.ssafy.cinemoa.image.enums.ImageCategory;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImageService {

    private static final String BASE_PATH = "https://j13a110.p.ssafy.io/api/image/";
    private final ImageConfig imageConfig;
    private final Set<String> allowed = Set.of(MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, "image/webp");

    @PostConstruct
    public void init() {
        for (ImageCategory category : ImageCategory.values()) {
            String directoryPath = Paths.get(imageConfig.getBase(), category.getImagePath()).toString();
            File directory = new File(directoryPath);

            if (!directory.exists()) {
                directory.mkdirs();
            }
        }
    }


    public ImageInfo getImage(String imageName) {
        if (imageName == null) {
            throw BadRequestException.ofInput("잘못된 파일명입니다.");
        }

        ImageCategory category = extractCategory(imageName);

        Path fullPath = Paths.get(imageConfig.getBase(), category.getImagePath(), imageName);
        try {
            return ImageInfo.of(fullPath);
        } catch (IOException e) {
            throw InternalServerException.ofUnknown();
        }
    }

    private ImageCategory extractCategory(String imageName) {
        int dashIndex = imageName.indexOf("-");
        if (dashIndex == -1) {
            throw BadRequestException.ofInput("유효하지 않은 이미지 형식입니다.");
        }

        String type = imageName.substring(0, dashIndex);

        ImageCategory category = ImageCategory.getCategory(type);

        if (category == null) {
            throw BadRequestException.ofInput("유효하지 않은 이미지입니다.");
        }

        return category;
    }

    public String saveImage(MultipartFile image, ImageCategory category) {
        checkImage(image);

        String baseDir = imageConfig.getBase();
        String midPath = category.getImagePath();
        String original = image.getOriginalFilename();

        if (original == null) {
            throw InternalServerException.ofUnknown();
        }
        String ext = original.substring(original.lastIndexOf('.') - 1);

        String filename = generateFileName(ImageCategory.BANNER, ext);

        Path fullPath = Paths.get(baseDir, midPath, filename);

        try {
            Files.copy(image.getInputStream(), fullPath, StandardCopyOption.REPLACE_EXISTING);
            return Paths.get(filename).toString();
        } catch (IOException e) {
            throw InternalServerException.ofUnknown();
        }
    }

    public void checkImage(MultipartFile givenImage) {
        String givenType = givenImage.getContentType();

        if (!allowed.contains(givenType)) {
            throw BadRequestException.ofInput("잘못된 타입의 이미지입니다.");
        }
    }

    public String translatePath(String localPath) {
        return BASE_PATH + localPath;
    }

    public void saveAnimation(AnimatorResult result) {
        try {
            String base64Data = result.getVideoData();
            if (base64Data.startsWith("data:video/mp4;base64,")) {
                base64Data = base64Data.substring("data:video/mp4;base64,".length());
            }

            byte[] videoBytes = Base64.getDecoder().decode(base64Data);
            String fileName = generateFileName(ImageCategory.TICKET, ".mp4");

            Path fullPath = Paths.get(imageConfig.getBase(), ImageCategory.TICKET.getImagePath(), fileName);

            Files.write(fullPath, videoBytes);
        } catch (Exception e) {
            throw InternalServerException.ofUnknown();
        }

    }

    private String generateFileName(ImageCategory imageCategory, String ext) {
        return imageCategory.getPrefix() + "-" + UUID.randomUUID() + ext;
    }
}
