package com.mict.ebook.admin.service;

import com.mict.ebook.admin.domain.Admin;
import com.mict.ebook.admin.domain.AdminErrorCode;
import com.mict.ebook.admin.dto.AdminResponse;
import com.mict.ebook.admin.dto.AdminSearchRequest;
import com.mict.ebook.admin.mapper.AdminRestMapper;
import com.mict.ebook.admin.repository.mapper.AdminMapper;
import com.mict.ebook.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminQueryService {

    private final AdminMapper adminMapper;
    private final AdminRestMapper adminRestMapper;

    public List<AdminResponse> search(AdminSearchRequest request) {
        List<Admin> admins = adminMapper.search(request.keyword(), request.department(), request.status());

        return admins.stream().map(this::toResponse).toList();
    }

    public AdminResponse getById(Long id) {
        return toResponse(findAdmin(id));
    }

    private Admin findAdmin(Long id) {
        return adminMapper.findById(id).orElseThrow(() -> new BusinessException(AdminErrorCode.ADMIN_NOT_FOUND));
    }

    private AdminResponse toResponse(Admin admin) {
        List<Long> roleIds = adminMapper.findRoleIdsByAdminId(admin.getId());
        return adminRestMapper.toResponse(admin, roleIds);
    }
}
