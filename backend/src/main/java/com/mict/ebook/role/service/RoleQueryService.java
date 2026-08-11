package com.mict.ebook.role.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.role.domain.Role;
import com.mict.ebook.role.domain.RoleErrorCode;
import com.mict.ebook.role.dto.RoleResponse;
import com.mict.ebook.role.dto.RoleSearchRequest;
import com.mict.ebook.role.mapper.RoleRestMapper;
import com.mict.ebook.role.repository.mapper.RoleMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleQueryService {

    private final RoleMapper roleMapper;
    private final RoleRestMapper roleRestMapper;

    public List<RoleResponse> search(RoleSearchRequest request) {
        List<Role> roles = roleMapper.search(request.workspaceId(), request.keyword());
        return roles.stream().map(this::toResponse).toList();
    }

    public RoleResponse getById(Long id) {
        return toResponse(findRole(id));
    }

    private Role findRole(Long id) {
        return roleMapper.findById(id).orElseThrow(() -> new BusinessException(RoleErrorCode.ROLE_NOT_FOUND));
    }

    private RoleResponse toResponse(Role role) {
        long memberCount = roleMapper.countMembersByRoleId(role.getId());
        List<Long> programIds = roleMapper.findProgramIdsByRoleId(role.getId());
        return roleRestMapper.toResponse(role, memberCount, programIds);
    }
}
