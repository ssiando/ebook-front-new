package com.mict.ebook.auth.service;

import com.mict.ebook.admin.domain.Admin;
import com.mict.ebook.admin.repository.mapper.AdminMapper;
import com.mict.ebook.auth.domain.AuthErrorCode;
import com.mict.ebook.auth.dto.LoginRequest;
import com.mict.ebook.auth.dto.LoginResponse;
import com.mict.ebook.auth.repository.mapper.AuthTokenBlacklistMapper;
import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.common.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AdminMapper adminMapper;
    private final AuthTokenBlacklistMapper authTokenBlacklistMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(rollbackFor = Exception.class)
    public LoginResponse login(LoginRequest request) {
        Admin admin = adminMapper
                .findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(AuthErrorCode.LOGIN_FAILED));

//        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
//            adminMapper.recordLoginFailure(admin.getId());
//            throw new BusinessException(AuthErrorCode.LOGIN_FAILED);
//        }
        if (!admin.isActiveYn()) {
            throw new BusinessException(AuthErrorCode.ACCOUNT_INACTIVE);
        }

        adminMapper.recordLoginSuccess(admin.getId(), LocalDateTime.now(), null);

        List<String> roles = adminMapper.findRoleNamesByAdminId(admin.getId());
        String accessToken =
                jwtTokenProvider.createAccessToken(admin.getEmail(), admin.getId(), admin.getAdminName(), roles);

        return new LoginResponse(
                accessToken,
                "Bearer",
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                admin.getId(),
                admin.getAdminName(),
                admin.getEmail(),
                roles);
    }

    @Transactional(rollbackFor = Exception.class)
    public void logout(Jwt jwt) {
        LocalDateTime now = LocalDateTime.now();
        authTokenBlacklistMapper.deleteExpired(now);

        LocalDateTime expiresAt = LocalDateTime.ofInstant(jwt.getExpiresAt(), ZoneId.systemDefault());
        authTokenBlacklistMapper.insert(jwt.getId(), expiresAt);
    }
}
