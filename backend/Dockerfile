# 빌드 단계
FROM public.ecr.aws/docker/library/amazoncorretto:17-alpine AS build
WORKDIR /workspace/app

# 의존성 캐시 최적화를 위해 build.gradle, settings.gradle, gradlew 먼저 복사
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
RUN --mount=type=cache,target=/root/.gradle ./gradlew dependencies

# 소스코드 복사 후 빌드
COPY src src
RUN --mount=type=cache,target=/root/.gradle ./gradlew bootJar

# 레이어 추출 준비
RUN mkdir -p build/dependency
RUN ls -l build/libs/
RUN (cd build/dependency;jar -xf ../libs/*-SNAPSHOT.jar)

# 실행 단계
FROM public.ecr.aws/docker/library/amazoncorretto:17-alpine
VOLUME /tmp

# 레이어별로 복사 (Spring Boot 공식 권장 방식)
ARG DEPENDENCY=/workspace/app/build/dependency
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

# 실행 명령
ENTRYPOINT ["java", "-cp", "app:app/lib/*", "io.ssafy.cinemoa.CinemoaApplication"]

EXPOSE 8443
