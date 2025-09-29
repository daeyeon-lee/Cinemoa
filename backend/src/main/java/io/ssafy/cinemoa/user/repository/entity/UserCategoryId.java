package io.ssafy.cinemoa.user.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
// 아래 세 코드 추가 : sara
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// 아래 세 코드 추가 : sara
@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class UserCategoryId {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "category_id")
    private Long categoryId;
}
