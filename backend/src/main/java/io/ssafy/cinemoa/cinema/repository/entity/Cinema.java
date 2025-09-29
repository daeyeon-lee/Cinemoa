package io.ssafy.cinemoa.cinema.repository.entity;

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

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cinemas")
public class Cinema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, name = "cinema_id")
    private Long cinemaId;

    @Column(nullable = false, name = "cinema_name")
    private String cinemaName;

    @Column(nullable = false)
    private String address;

    @Column(columnDefinition = "varchar(10)")
    private String city;

    @Column(columnDefinition = "varchar(10)")
    private String district;

    @Column(name = "is_imax", nullable = false)
    @ColumnDefault("false")
    private Boolean isImax;

    @Column(name = "is_screenx", nullable = false)
    @ColumnDefault("false")
    private Boolean isScreenX;

    @Column(name = "is_4dx", nullable = false)
    @ColumnDefault("false")
    private Boolean is4dx;

    @Column(name = "is_dolby", nullable = false)
    @ColumnDefault("false")
    private Boolean isDolby;

    @Column(name = "is_recliner", nullable = false)
    @ColumnDefault("false")
    private Boolean isRecliner;

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
        Cinema cinema = (Cinema) o;
        return getCinemaId() != null && Objects.equals(getCinemaId(), cinema.getCinemaId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer()
                .getPersistentClass()
                .hashCode() : getClass().hashCode();
    }
}
