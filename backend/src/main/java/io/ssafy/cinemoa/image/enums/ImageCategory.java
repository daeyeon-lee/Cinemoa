package io.ssafy.cinemoa.image.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ImageCategory {
    BANNER("banner", "images/banners/"),
    TICKET("ticket", "images/tickets/");

    private final String prefix;
    private final String imagePath;

    public static String getImagePath(String imageName) {
        for (ImageCategory category : ImageCategory.values()) {
            if (imageName.startsWith(category.getPrefix())) {
                return category.getImagePath();
            }
        }
        return null;
    }

    public static ImageCategory getCategory(String type) {
        for (ImageCategory category : ImageCategory.values()) {
            if (type.equals(category.getPrefix())) {
                return category;
            }
        }
        return null;
    }
}
