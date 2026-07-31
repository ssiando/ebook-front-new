package com.mict.ebook.admin.repository.mapper;

import com.mict.ebook.admin.domain.Admin;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminMapper {

    Optional<Admin> findByAccount(@Param("account") String account);

    List<String> findRoleNamesByAdminId(@Param("adminId") Long adminId);
}
