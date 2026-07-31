package com.mict.ebook.auth.repository.mapper;

import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthTokenBlacklistMapper {

    void insert(@Param("jti") String jti, @Param("expiresAt") LocalDateTime expiresAt);

    boolean existsByJti(@Param("jti") String jti);

    void deleteExpired(@Param("now") LocalDateTime now);
}
