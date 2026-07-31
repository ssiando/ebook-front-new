package com.mict.ebook.common.security;

import com.mict.ebook.auth.repository.mapper.AuthTokenBlacklistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtBlacklistValidator implements OAuth2TokenValidator<Jwt> {

    private static final OAuth2Error REVOKED_TOKEN_ERROR =
            new OAuth2Error("token_revoked", "로그아웃되어 더 이상 사용할 수 없는 토큰입니다.", null);

    private final AuthTokenBlacklistMapper authTokenBlacklistMapper;

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        if (token.getId() != null && authTokenBlacklistMapper.existsByJti(token.getId())) {
            return OAuth2TokenValidatorResult.failure(REVOKED_TOKEN_ERROR);
        }
        return OAuth2TokenValidatorResult.success();
    }
}
