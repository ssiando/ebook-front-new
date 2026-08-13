import com.diffplug.gradle.spotless.SpotlessExtension

plugins {
    java
    id("org.springframework.boot") version "3.3.4"
    id("io.spring.dependency-management") version "1.1.6"
    id("com.diffplug.spotless") version "6.25.0"
    id("org.flywaydb.flyway") version "10.15.2"
}

group = "com.mict"
version = "0.0.1-SNAPSHOT"
description = "ebook 관리자 백엔드"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

val mapstructVersion = "1.6.3"

dependencies {
    // Web / Validation / Actuator
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Security / JWT
    // 별도 인가서버(Keycloak 등) 없이 자체 발급 JWT(HS256)를 사용합니다.
    // common/config/SecurityConfig가 oauth2-resource-server의 JwtEncoder/JwtDecoder를
    // 공유 비밀키(app.jwt.secret) 기반으로 직접 구성합니다. 실제 IdP 연동 시 issuer-uri 방식으로 교체하세요.
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

    // DB: MyBatis + MariaDB + Flyway
    implementation("org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")

    // 배치 작업 (DB 백업 등 수동 실행 배치). 메타데이터 테이블은 Flyway 마이그레이션으로 직접
    // 관리하므로 spring.batch.jdbc.initialize-schema는 never로 둡니다 (application.yml 참고).
    implementation("org.springframework.boot:spring-boot-starter-batch")
    // waffle-jna(Windows SSPI/GSSAPI 통합 인증)를 제외합니다. 이게 classpath에 있으면
    // mariadb-java-client가 우리가 지정한 계정(username/password) 대신 현재 프로세스의
    // Windows 로그인 계정으로 통합 인증을 먼저 시도해 로컬 DB 접속이 깨집니다.
    runtimeOnly("org.mariadb.jdbc:mariadb-java-client") {
        exclude(group = "com.github.waffle", module = "waffle-jna")
    }

    // DTO <-> Entity 매핑
    implementation("org.mapstruct:mapstruct:$mapstructVersion")
    annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")

    // Lombok (+ MapStruct 조합 시 어노테이션 처리 순서 보정용 바인딩)
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")
    testCompileOnly("org.projectlombok:lombok")
    testAnnotationProcessor("org.projectlombok:lombok")

    // API 문서 (Swagger UI)
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    // 실행 SQL/파라미터 로그
    implementation("com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.9.1")

    // JSON 로그 출력
    implementation("net.logstash.logback:logstash-logback-encoder:8.0")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// Gradle CLI에서 앱 기동 없이 바로 마이그레이션을 다루기 위한 설정
// (flywayMigrate / flywayInfo / flywayClean 등). 앱을 기동하면 Spring Boot가
// 자동으로 같은 위치(src/main/resources/db/migration)의 스크립트를 적용하므로
// 아래 설정은 로컬에서 DB만 미리 정리하고 싶을 때 쓰는 보조 수단입니다.
flyway {
    url =
        "jdbc:mariadb://127.0.0.1:13306/ebook?restrictedAuth=mysql_native_password,mysql_clear_password,client_ed25519,caching_sha2_password"
    user = "ipnac"
    password = "ipnac"
    locations = arrayOf("classpath:db/migration")
}

configure<SpotlessExtension> {
    java {
        target("src/*/java/**/*.java")
        palantirJavaFormat()
        removeUnusedImports()
        importOrder()
        formatAnnotations()
        endWithNewline()
    }
}
