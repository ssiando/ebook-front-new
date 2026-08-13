package com.mict.ebook.workspace.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.workspace.domain.Workspace;
import com.mict.ebook.workspace.domain.WorkspaceErrorCode;
import com.mict.ebook.workspace.dto.CreateWorkspaceRequest;
import com.mict.ebook.workspace.dto.UpdateWorkspaceRequest;
import com.mict.ebook.workspace.dto.WorkspaceResponse;
import com.mict.ebook.workspace.mapper.WorkspaceRestMapper;
import com.mict.ebook.workspace.repository.mapper.WorkspaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class WorkspaceCommandService {

    private final WorkspaceMapper workspaceMapper;
    private final WorkspaceRestMapper workspaceRestMapper;

    public WorkspaceResponse create(CreateWorkspaceRequest request, Long currentAdminPk) {
        if (workspaceMapper.existsByName(request.name())) {
            throw new BusinessException(WorkspaceErrorCode.WORKSPACE_NAME_DUPLICATE);
        }

        Workspace workspace = Workspace.createNew(request.name(), request.description(), currentAdminPk);
        workspaceMapper.insert(workspace);
        return workspaceRestMapper.toResponse(workspace);
    }

    public WorkspaceResponse update(Long id, UpdateWorkspaceRequest request, Long currentAdminPk) {
        Workspace workspace = findWorkspace(id);
        if (workspaceMapper.existsByNameExcludingId(request.name(), id)) {
            throw new BusinessException(WorkspaceErrorCode.WORKSPACE_NAME_DUPLICATE);
        }

        workspace.update(request.name(), request.description(), request.stat(), currentAdminPk);
        workspaceMapper.update(workspace);
        return workspaceRestMapper.toResponse(workspace);
    }

    public void delete(Long id) {
        findWorkspace(id);
        workspaceMapper.deleteById(id);
    }

    private Workspace findWorkspace(Long id) {
        return workspaceMapper
                .findById(id)
                .orElseThrow(() -> new BusinessException(WorkspaceErrorCode.WORKSPACE_NOT_FOUND));
    }
}
