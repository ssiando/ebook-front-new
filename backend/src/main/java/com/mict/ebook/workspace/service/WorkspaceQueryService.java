package com.mict.ebook.workspace.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.workspace.domain.Workspace;
import com.mict.ebook.workspace.domain.WorkspaceErrorCode;
import com.mict.ebook.workspace.dto.WorkspaceResponse;
import com.mict.ebook.workspace.dto.WorkspaceSearchRequest;
import com.mict.ebook.workspace.mapper.WorkspaceRestMapper;
import com.mict.ebook.workspace.repository.mapper.WorkspaceMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkspaceQueryService {

    private final WorkspaceMapper workspaceMapper;
    private final WorkspaceRestMapper workspaceRestMapper;

    public List<WorkspaceResponse> search(WorkspaceSearchRequest request) {
        return workspaceMapper.search(request.keyword()).stream()
                .map(workspaceRestMapper::toResponse)
                .toList();
    }

    public WorkspaceResponse getById(Long id) {
        return workspaceRestMapper.toResponse(findWorkspace(id));
    }

    private Workspace findWorkspace(Long id) {
        return workspaceMapper
                .findById(id)
                .orElseThrow(() -> new BusinessException(WorkspaceErrorCode.WORKSPACE_NOT_FOUND));
    }
}
