package com.mict.ebook.admin.repository.mapper;

import com.mict.ebook.admin.domain.Admin;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminMapper {

    Optional<Admin> findByEmail(@Param("email") String email);

    List<String> findRoleNamesByAdminId(@Param("adminId") Long adminId);

    List<Admin> search(
            @Param("keyword") String keyword, @Param("department") String department, @Param("status") String status);

    Optional<Admin> findById(@Param("id") Long id);

    boolean existsByEmail(@Param("email") String email);

    boolean existsByEmailExcludingId(@Param("email") String email, @Param("id") Long id);

    boolean existsByLoginId(@Param("loginId") String loginId);

    boolean existsByLoginIdExcludingId(@Param("loginId") String loginId, @Param("id") Long id);

    void insert(Admin admin);

    void update(Admin admin);

    void recordLoginSuccess(
            @Param("id") Long id, @Param("lastLoginAt") LocalDateTime lastLoginAt, @Param("lastLoginIp") String lastLoginIp);

    void recordLoginFailure(@Param("id") Long id);

    void deleteById(@Param("id") Long id);

    List<Long> findRoleIdsByAdminId(@Param("adminId") Long adminId);

    void deleteAdminRoles(@Param("adminId") Long adminId);

    void insertAdminRoles(@Param("adminId") Long adminId, @Param("roleIds") List<Long> roleIds);

    List<String> findGroupCodesByAdminId(@Param("adminId") Long adminId);

    void deleteAdminGroups(@Param("adminId") Long adminId);

    void insertAdminGroups(@Param("adminId") Long adminId, @Param("groupCodes") List<String> groupCodes);
}
