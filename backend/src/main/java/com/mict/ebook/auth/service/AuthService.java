package com.mict.ebook.auth.service;

import com.mict.ebook.admin.domain.Admin;
import com.mict.ebook.admin.repository.mapper.AdminMapper;
import com.mict.ebook.auth.domain.AuthErrorCode;
import com.mict.ebook.auth.dto.LoginRequest;
import com.mict.ebook.auth.dto.LoginResponse;
import com.mict.ebook.auth.repository.mapper.AuthTokenBlacklistMapper;
import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.common.security.JwtTokenProvider;
import com.mict.ebook.menu.dto.MenuTreeResponse;
import com.mict.ebook.menu.service.MenuQueryService;
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

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final AdminMapper adminMapper;
    private final AuthTokenBlacklistMapper authTokenBlacklistMapper;
    private final MenuQueryService menuQueryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Admin admin = adminMapper
                .findByAccount(request.account())
                .orElseThrow(() -> new BusinessException(AuthErrorCode.LOGIN_FAILED));

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new BusinessException(AuthErrorCode.LOGIN_FAILED);
        }
        if (!ACTIVE_STATUS.equals(admin.getStatus())) {
            throw new BusinessException(AuthErrorCode.ACCOUNT_INACTIVE);
        }

        List<String> roles = adminMapper.findRoleNamesByAdminId(admin.getId());
        String accessToken =
                jwtTokenProvider.createAccessToken(admin.getAdminId(), admin.getId(), admin.getAdminName(), roles);
        List<MenuTreeResponse> menus = menuQueryService.getMenuTree(roles);

        return new LoginResponse(
                accessToken,
                "Bearer",
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                admin.getId(),
                admin.getAdminId(),
                admin.getAdminName(),
                admin.getEmail(),
                admin.getDepartment(),
                admin.getStatus(),
                roles,
                menus);
    }

    @Transactional(rollbackFor = Exception.class)
    public void logout(Jwt jwt) {
        LocalDateTime now = LocalDateTime.now();
        authTokenBlacklistMapper.deleteExpired(now);

        LocalDateTime expiresAt = LocalDateTime.ofInstant(jwt.getExpiresAt(), ZoneId.systemDefault());
        authTokenBlacklistMapper.insert(jwt.getId(), expiresAt);
    }
}
