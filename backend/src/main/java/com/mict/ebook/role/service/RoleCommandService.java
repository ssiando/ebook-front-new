package com.mict.ebook.role.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.role.domain.Role;
import com.mict.ebook.role.domain.RoleErrorCode;
import com.mict.ebook.role.dto.CreateRoleRequest;
import com.mict.ebook.role.dto.RoleResponse;
import com.mict.ebook.role.dto.UpdateRoleProgramsRequest;
import com.mict.ebook.role.dto.UpdateRoleRequest;
import com.mict.ebook.role.mapper.RoleRestMapper;
import com.mict.ebook.role.repository.mapper.RoleMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class RoleCommandService {

    private final RoleMapper roleMapper;
    private final RoleRestMapper roleRestMapper;

    public RoleResponse create(CreateRoleRequest request) {
        if (roleMapper.existsByRoleNameAndSystem(request.roleName(), request.system())) {
            throw new BusinessException(RoleErrorCode.ROLE_NAME_DUPLICATE);
        }

        Role role = Role.createNew(request.roleName(), request.description(), request.system(), request.registrant());
        roleMapper.insert(role);
        return roleRestMapper.toResponse(role, 0, List.of());
    }

    public RoleResponse update(Long id, UpdateRoleRequest request) {
        Role role = findRole(id);
        role.update(request.roleName(), request.description(), request.registrant());
        roleMapper.update(role);
        return roleRestMapper.toResponse(
                role, roleMapper.countMembersByRoleId(id), roleMapper.findProgramIdsByRoleId(id));
    }

    public void delete(Long id) {
        findRole(id);
        roleMapper.deleteRolePrograms(id);
        roleMapper.deleteById(id);
    }

    public RoleResponse updatePrograms(Long id, UpdateRoleProgramsRequest request) {
        Role role = findRole(id);
        roleMapper.deleteRolePrograms(id);
        if (!request.programIds().isEmpty()) {
            roleMapper.insertRolePrograms(id, request.programIds());
        }
        long memberCount = roleMapper.countMembersByRoleId(id);
        return roleRestMapper.toResponse(role, memberCount, request.programIds());
    }

    private Role findRole(Long id) {
        return roleMapper.findById(id).orElseThrow(() -> new BusinessException(RoleErrorCode.ROLE_NOT_FOUND));
    }
}
