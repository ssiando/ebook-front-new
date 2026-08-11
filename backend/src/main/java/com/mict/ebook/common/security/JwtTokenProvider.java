package com.mict.ebook.common.security;

import com.mict.ebook.common.config.JwtProperties;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private static final String ISSUER = "ebook-backend";

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public String createAccessToken(String subject, Long adminPk, String adminName, List<String> roles) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(jwtProperties.accessTokenValiditySeconds()))
                .subject(subject)
                .id(UUID.randomUUID().toString())
                .claim("adminPk", adminPk)
                .claim("adminName", adminName)
                .claim("roles", roles)
                .build();

        // NimbusJwtEncoder는 JwsHeader를 지정하지 않으면 기본 알고리즘(RS256)으로 서명 키를 찾으려 해서
        // 대칭키(HMAC) 기반 JwtEncoder에서는 "Failed to select a JWK signing key" 오류가 발생한다.
        // 반드시 대칭키에 맞는 MacAlgorithm.HS256을 명시해야 한다.
        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public long getAccessTokenValiditySeconds() {
        return jwtProperties.accessTokenValiditySeconds();
    }
}
