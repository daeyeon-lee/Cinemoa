package io.ssafy.cinemoa.cinema.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "screens")
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, name = "screen_id")
    private Long screenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(nullable = false, name = "screen_name")
    private String screenName;

    @Column(nullable = false)
    private Integer seats;

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

    private Integer price;

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
        Screen screen = (Screen) o;
        return getScreenId() != null && Objects.equals(getScreenId(), screen.getScreenId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer()
                .getPersistentClass()
                .hashCode() : getClass().hashCode();
    }
}
