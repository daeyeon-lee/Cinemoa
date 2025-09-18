// 회원 정보 조회(GET)
// /api/user/{userId}
// 200
// {
// 	"state": "SUCCESS",
// 	"message" : "조회 성공",
// 	"code": 0,
// 	"data": {
// 		"nickname":"사용자 닉네임"
// 		"profile_img_url": "사용자 이미지 url"
// 	},
// }
package io.ssafy.cinemoa.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private String nickname;

    private String profileImgUrl;
}
