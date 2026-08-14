package com.mict.ebook.common.security;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * 컨트롤러마다 반복되던 {@code @AuthenticationPrincipal Jwt jwt} + {@code jwt.getClaim("adminPk")}를
 * 대체하는 접근자. Spring Security가 요청 스레드에 채워 둔 {@link SecurityContextHolder}를 그대로
 * 읽기 때문에 별도 ThreadLocal 관리가 필요 없고, 컨트롤러뿐 아니라 서비스 계층에서도 바로 호출할 수 있다.
 */
public final class AuthContext {

    private AuthContext() {}

    public static Long getCurrentAdminPk() {
        return getCurrentJwt().getClaim("adminPk");
    }

    public static List<String> getCurrentRoles() {
        return getCurrentJwt().getClaimAsStringList("roles");
    }

    public static Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("인증된 사용자 정보를 찾을 수 없습니다.");
        }
        return jwt;
    }
}
