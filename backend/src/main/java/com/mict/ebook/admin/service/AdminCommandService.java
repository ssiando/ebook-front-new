package com.mict.ebook.admin.service;

import com.mict.ebook.admin.domain.Admin;
import com.mict.ebook.admin.domain.AdminErrorCode;
import com.mict.ebook.admin.dto.AdminResponse;
import com.mict.ebook.admin.dto.CreateAdminRequest;
import com.mict.ebook.admin.dto.UpdateAdminRequest;
import com.mict.ebook.admin.dto.UpdateAdminRolesRequest;
import com.mict.ebook.admin.mapper.AdminRestMapper;
import com.mict.ebook.admin.repository.mapper.AdminMapper;
import com.mict.ebook.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AdminCommandService {

    private final AdminMapper adminMapper;
    private final AdminRestMapper adminRestMapper;
    private final PasswordEncoder passwordEncoder;

    public AdminResponse create(CreateAdminRequest request) {
        if (adminMapper.existsByAdminId(request.adminId())) {
            throw new BusinessException(AdminErrorCode.ADMIN_ID_DUPLICATE);
        }
        if (adminMapper.existsByEmail(request.email())) {
            throw new BusinessException(AdminErrorCode.EMAIL_DUPLICATE);
        }

        String passwordHash = passwordEncoder.encode(request.password());
        Admin admin = Admin.createNew(
                request.adminId(),
                request.adminName(),
                request.email(),
                passwordHash,
                request.department(),
                request.registrant());
        adminMapper.insert(admin);

        List<Long> roleIds = request.roleIds() == null ? List.of() : request.roleIds();
        if (!roleIds.isEmpty()) {
            adminMapper.insertAdminRoles(admin.getId(), roleIds);
        }
        return adminRestMapper.toResponse(admin, roleIds);
    }

    public AdminResponse update(Long id, UpdateAdminRequest request) {
        Admin admin = findAdmin(id);
        if (!admin.getEmail().equals(request.email()) && adminMapper.existsByEmail(request.email())) {
            throw new BusinessException(AdminErrorCode.EMAIL_DUPLICATE);
        }

        admin.update(
                request.adminName(),
                request.email(),
                request.department(),
                request.status(),
                request.registrant(),
                joinGroups(request.groups()),
                request.serviceExpiresAt());
        adminMapper.update(admin);
        return adminRestMapper.toResponse(admin, adminMapper.findRoleIdsByAdminId(id));
    }

    public AdminResponse updateRoles(Long id, UpdateAdminRolesRequest request) {
        Admin admin = findAdmin(id);
        adminMapper.deleteAdminRoles(id);
        if (!request.roleIds().isEmpty()) {
            adminMapper.insertAdminRoles(id, request.roleIds());
        }
        return adminRestMapper.toResponse(admin, request.roleIds());
    }

    public void delete(Long id) {
        findAdmin(id);
        adminMapper.deleteAdminRoles(id);
        adminMapper.deleteById(id);
    }

    private Admin findAdmin(Long id) {
        return adminMapper.findById(id).orElseThrow(() -> new BusinessException(AdminErrorCode.ADMIN_NOT_FOUND));
    }

    private String joinGroups(List<String> groups) {
        return groups == null || groups.isEmpty() ? null : String.join(",", groups);
    }
}
