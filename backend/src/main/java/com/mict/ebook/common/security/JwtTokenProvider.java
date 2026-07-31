package com.mict.ebook.common.security;

import com.mict.ebook.common.config.JwtProperties;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
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

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public long getAccessTokenValiditySeconds() {
        return jwtProperties.accessTokenValiditySeconds();
    }
}
