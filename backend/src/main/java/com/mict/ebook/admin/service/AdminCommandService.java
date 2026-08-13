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

    public AdminResponse create(CreateAdminRequest request, Long currentAdminPk) {
        if (adminMapper.existsByEmail(request.email())) {
            throw new BusinessException(AdminErrorCode.EMAIL_DUPLICATE);
        }
        if (adminMapper.existsByLoginId(request.loginId())) {
            throw new BusinessException(AdminErrorCode.LOGIN_ID_DUPLICATE);
        }

        String passwordHash = passwordEncoder.encode(request.password());
        Admin admin = Admin.createNew(
                request.loginId(), request.adminName(), request.email(), passwordHash, request.department(), currentAdminPk);
        adminMapper.insert(admin);

        List<Long> roleIds = request.roleIds() == null ? List.of() : request.roleIds();
        if (!roleIds.isEmpty()) {
            adminMapper.insertAdminRoles(admin.getId(), roleIds);
        }
        return adminRestMapper.toResponse(admin, roleIds, List.of());
    }

    public AdminResponse update(Long id, UpdateAdminRequest request, Long currentAdminPk) {
        Admin admin = findAdmin(id);
        if (!admin.getEmail().equals(request.email()) && adminMapper.existsByEmailExcludingId(request.email(), id)) {
            throw new BusinessException(AdminErrorCode.EMAIL_DUPLICATE);
        }

        admin.update(
                request.adminName(), request.email(), request.department(), request.status(),
                request.serviceExpiresAt(), currentAdminPk);
        adminMapper.update(admin);

        List<String> groupCodes = request.groupCodes() == null ? List.of() : request.groupCodes();
        adminMapper.deleteAdminGroups(id);
        if (!groupCodes.isEmpty()) {
            adminMapper.insertAdminGroups(id, groupCodes);
        }

        return adminRestMapper.toResponse(admin, adminMapper.findRoleIdsByAdminId(id), groupCodes);
    }

    public AdminResponse updateRoles(Long id, UpdateAdminRolesRequest request) {
        Admin admin = findAdmin(id);
        adminMapper.deleteAdminRoles(id);
        if (!request.roleIds().isEmpty()) {
            adminMapper.insertAdminRoles(id, request.roleIds());
        }
        List<String> groupCodes = adminMapper.findGroupCodesByAdminId(id);
        return adminRestMapper.toResponse(admin, request.roleIds(), groupCodes);
    }

    public void delete(Long id) {
        findAdmin(id);
        adminMapper.deleteAdminRoles(id);
        adminMapper.deleteAdminGroups(id);
        adminMapper.deleteById(id);
    }

    private Admin findAdmin(Long id) {
        return adminMapper.findById(id).orElseThrow(() -> new BusinessException(AdminErrorCode.ADMIN_NOT_FOUND));
    }
}
