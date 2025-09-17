package io.ssafy.cinemoa.user.repository.entity;

import io.ssafy.cinemoa.global.repository.entity.BaseTimeEntity;
import io.ssafy.cinemoa.security.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.proxy.HibernateProxy;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, name = "user_id")
    private Long id;

    @Column(columnDefinition = "varchar(40)", nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "varchar(50)", nullable = false)
    private String nickname;

    @Column(columnDefinition = "varchar(11)", name = "phone_number")
    private String phoneNumber;

    @Column(name = "profile_img_url", nullable = false)
    private String profileImgUrl;

    @Column(columnDefinition = "varchar(16)", name = "refund_account_number")
    private String refundAccountNumber;

    @Column(name = "is_adult", nullable = false)
    @ColumnDefault("false")
    private Boolean isAdult;

    @Column(columnDefinition = "varchar(11)", name = "bank_code")
    private String bankCode;

    private Role role;

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null) {
            return false;
        }
        Class<?> oEffectiveClass = o instanceof HibernateProxy
                ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass()
                : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass()
                : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) {
            return false;
        }
        User user = (User) o;
        return getId() != null && Objects.equals(getId(), user.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer()
                .getPersistentClass()
                .hashCode() : getClass().hashCode();
    }

    // 추가 정보 업데이트 : sara
    public void updateAdditionalInfo(String refundAccountNumber, String bankCode) {
        this.refundAccountNumber = refundAccountNumber;
        this.bankCode = bankCode;
    }
}
